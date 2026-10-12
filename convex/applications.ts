import { v, ConvexError } from "convex/values";
import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { RateLimiter, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";
import { mutation, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { applicationInput, application, applicationAction, counts, activity } from "./validators";
import { staffMutation, staffQuery, requirePermission, text, email, log, activityDto, dto } from "./lib/access";
import { publishedContent } from "./content";
import { can } from "../apps/portal/src/data/types";
import type { Infer } from "convex/values";

const limiter=new RateLimiter(components.rateLimiter,{submissions:{kind:"fixed window",rate:200,period:HOUR},emailSubmissions:{kind:"fixed window",rate:5,period:HOUR}});
async function input(ctx:QueryCtx,value:Infer<typeof applicationInput>) {
  const cleaned={...value,name:text(value.name,"Name",150),email:email(value.email),phone:text(value.phone,"Phone",30),address:text(value.address,"Address",2000),occupation:text(value.occupation,"Occupation",200),purpose:text(value.purpose,"Purpose",4000)};
  if(!/^[+()\d\s-]{5,30}$/.test(cleaned.phone)) throw new ConvexError("Enter a valid phone number.");
  if(cleaned.kind==="loan") {
    cleaned.memberNumber=text(cleaned.memberNumber,"Member number",100);
    const published=await publishedContent(ctx);
    if(!published.loans.some(l=>l.id===cleaned.product)||!Number.isFinite(cleaned.amount)||cleaned.amount<=0||cleaned.amount>1e10||!Number.isInteger(cleaned.months)||cleaned.months<1||cleaned.months>1200) throw new ConvexError("Choose a valid product, positive loan amount and whole-month term.");
  }
  if(cleaned.assigneeId) {
    const person=await ctx.db.get(cleaned.assigneeId);
    if(!person||!person.userId||!can(dto(person),"applications:review")) throw new ConvexError("Choose an active officer or administrator.");
  }
  return cleaned;
}
async function changeCount(ctx:MutationCtx,previous:Doc<"applications">["status"]|null,next:Doc<"applications">["status"],kind:Doc<"applications">["kind"]) {
  const row=await ctx.db.query("counts").withIndex("by_key",q=>q.eq("key","applications")).unique();
  if(!row) throw new ConvexError("Applications are not available yet. Please contact Sofora.");
  const value={...row.value};
  if(previous) value[previous]-=1; else {value.total+=1;value[kind]+=1;}
  value[next]+=1;
  await ctx.db.patch(row._id,{value});
}
async function create(ctx:MutationCtx,value:Infer<typeof applicationInput>,requestId:string,actorId:string,source:"website"|"staff") {
  if(!/^[0-9a-f-]{36}$/.test(requestId)) throw new ConvexError("Invalid submission identifier.");
  const values=await input(ctx,value);
  const existing=await ctx.db.query("applications").withIndex("by_requestId",q=>q.eq("requestId",requestId)).unique();
  if(existing) return {id:existing._id,reference:existing.reference};
  if(source==="website") {
    await limiter.limit(ctx,"submissions",{throws:true});
    await limiter.limit(ctx,"emailSubmissions",{key:values.email,throws:true});
  }
  const counter=await ctx.db.query("counts").withIndex("by_key",q=>q.eq("key","applications")).unique();
  if(!counter) throw new ConvexError("Applications are not available yet. Please contact Sofora.");
  const submittedAt=new Date().toISOString();
  const reference=`${values.kind==="loan"?"LN":"MB"}-${submittedAt.slice(0,4)}-${String(counter.value.total+1).padStart(6,"0")}`;
  const id=await ctx.db.insert("applications",{...values,reference,submittedAt,status:"new",revision:1,requestId,source,informationRequest:"",recommendation:null,decision:null});
  await changeCount(ctx,null,"new",values.kind);
  await log(ctx,actorId,"applications",id,`Received ${reference} from ${source==="website"?"the website":"staff entry"}`);
  return {id,reference};
}
export const submit=mutation({args:{input:applicationInput,requestId:v.string(),consent:v.boolean(),website:v.string()},returns:v.object({reference:v.string()}),handler:async(ctx,args)=>{
  if(!args.consent||args.website||args.input.assigneeId) throw new ConvexError("Please confirm the application details and consent.");
  const result=await create(ctx,args.input,args.requestId,"website","website");
  return {reference:result.reference};
}});
export const add=staffMutation({args:{input:applicationInput,requestId:v.string()},returns:v.id("applications"),handler:async(ctx,args)=>{
  requirePermission(ctx.person,"applications:review");
  return (await create(ctx,args.input,args.requestId,ctx.person._id,"staff")).id;
}});
function summary(row:Doc<"applications">) {
  const {_id,_creationTime,requestId,...fields}=row;
  void _creationTime;void requestId;
  return {...fields,id:_id,notes:[],history:[]};
}
export const list=staffQuery({args:{paginationOpts:paginationOptsValidator},returns:paginationResultValidator(application),handler:async(ctx,args)=>{
  requirePermission(ctx.person,"applications:view");
  const result=await ctx.db.query("applications").order("desc").paginate(args.paginationOpts);
  return {...result,page:result.page.map(summary)};
}});
export const detail=staffQuery({args:{id:v.string()},returns:v.union(v.null(),application),handler:async(ctx,{id})=>{
  requirePermission(ctx.person,"applications:view");
  const normalized=ctx.db.normalizeId("applications",id);
  const row=normalized?await ctx.db.get(normalized):null;if(!row) return null;
  const [history,notes]=await Promise.all([false,true].map(note=>ctx.db.query("activity").withIndex("by_entity_and_note",q=>q.eq("entity",id).eq("note",note)).order("desc").take(100)));
  return {...summary(row),history:history!.map(activityDto),notes:notes!.map(activityDto)};
}});
export const totals=staffQuery({args:{},returns:counts,handler:async ctx=>{
  requirePermission(ctx.person,"applications:view");
  const row=await ctx.db.query("counts").withIndex("by_key",q=>q.eq("key","applications")).unique();
  return row?.value??{total:0,membership:0,loan:0,new:0,in_review:0,needs_information:0,recommended:0,approved:0,rejected:0};
}});
export const recentActivity=staffQuery({args:{},returns:v.array(activity),handler:async ctx=>{
  const scopes=(can(dto(ctx.person),"staff:manage")?["content","applications","staff"]:[...(can(dto(ctx.person),"content:view")?["content"]:[]),...(can(dto(ctx.person),"applications:view")?["applications"]:[])]) as ("content"|"applications"|"staff")[];
  const results=await Promise.all(scopes.map(scope=>ctx.db.query("activity").withIndex("by_scope",q=>q.eq("scope",scope)).order("desc").take(12)));
  return results.flat().filter(a=>!a.note).sort((a,b)=>b._creationTime-a._creationTime).slice(0,12).map(activityDto);
}});
async function editable(ctx:MutationCtx,id:Id<"applications">,revision:number) {
  const row=await ctx.db.get(id);
  if(!row) throw new ConvexError("Application not found.");
  if(row.revision!==revision) throw new ConvexError("This application changed. Reload before saving.");
  return row;
}
export const save=staffMutation({args:{id:v.id("applications"),revision:v.number(),input:applicationInput},returns:v.null(),handler:async(ctx,args)=>{
  requirePermission(ctx.person,"applications:review");
  const row=await editable(ctx,args.id,args.revision);
  if(!["new","in_review","needs_information"].includes(row.status)||row.kind!==args.input.kind) throw new ConvexError("Applicant details are locked.");
  await ctx.db.patch(row._id,{...await input(ctx,args.input),revision:row.revision+1});
  await log(ctx,ctx.person._id,"applications",row._id,`Updated applicant details on ${row.reference}`);return null;
}});
export const update=staffMutation({args:{id:v.id("applications"),revision:v.number(),action:applicationAction},returns:v.null(),handler:async(ctx,{id,revision,action})=>{
  requirePermission(ctx.person,action.type==="decide"?"applications:decide":"applications:review");
  const row=await editable(ctx,id,revision);
  if(action.type!=="note"&&["approved","rejected"].includes(row.status)) throw new ConvexError("A final decision has already been recorded.");
  const patch:Partial<Doc<"applications">>={revision:row.revision+1};
  let message="";
  if(action.type==="note") {
    await log(ctx,ctx.person._id,"applications",id,text(action.text,"Note"),true);message=`Added an internal note to ${row.reference}`;
  } else if(action.type==="assign") {
    const person=action.userId?await ctx.db.get(action.userId):null;
    if(action.userId&&(!person?.userId||!can(dto(person),"applications:review"))) throw new ConvexError("Choose an active officer or administrator.");
    patch.assigneeId=action.userId;message=`${person?`Assigned to ${person.name}`:"Unassigned"}: ${row.reference}`;
  } else if(action.type==="review") {
    if(row.status==="in_review") throw new ConvexError("Already in review.");
    patch.status="in_review";patch.informationRequest="";patch.recommendation=null;message=`Started review of ${row.reference}`;
  } else if(action.type==="request_information") {
    if(row.status!=="in_review") throw new ConvexError("Start reviewing first.");
    patch.informationRequest=text(action.text,"Missing information");patch.status="needs_information";message=`Requested information on ${row.reference}: ${patch.informationRequest}`;
  } else if(action.type==="recommend") {
    if(row.status!=="in_review") throw new ConvexError("Start reviewing before recommending a decision.");
    patch.status="recommended";patch.recommendation={decision:action.decision,reason:text(action.text,"Recommendation"),actorId:ctx.person._id,at:new Date().toISOString()};message=`Recommended ${action.decision} for ${row.reference}`;
  } else {
    if(row.status!=="recommended"||!row.recommendation) throw new ConvexError("An officer recommendation is required.");
    patch.status=action.decision;patch.decision={outcome:action.decision,reason:text(action.text,"Decision reason"),actorId:ctx.person._id,at:new Date().toISOString()};message=`${action.decision}: ${row.reference}`;
  }
  if(patch.status&&patch.status!==row.status) await changeCount(ctx,row.status,patch.status,row.kind);
  await ctx.db.patch(id,patch);await log(ctx,ctx.person._id,"applications",id,message);return null;
}});
