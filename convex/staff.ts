import { v, ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { staff as staffValidator, role } from "./validators";
import { staffQuery, staffMutation, currentStaff, dto, requirePermission, text, email, hash, log } from "./lib/access";

export const me=query({args:{},returns:v.union(v.null(),staffValidator),handler:async ctx=>{const person=await currentStaff(ctx);return person?dto(person):null;}});
export const list=staffQuery({args:{},returns:v.array(staffValidator),handler:async ctx=>(await ctx.db.query("staff").take(201)).map(dto)});
export const save=staffMutation({args:{id:v.optional(v.id("staff")),name:v.string(),email:v.string(),roles:v.array(role),active:v.boolean()},returns:v.id("staff"),handler:async(ctx,args)=>{
  requirePermission(ctx.person,"staff:manage");
  const name=text(args.name,"Name",120), address=email(args.email);
  if (!args.roles.length) throw new ConvexError("Assign at least one role.");
  const existing=args.id?await ctx.db.get(args.id):null;
  if (args.id&&!existing) throw new ConvexError("Staff member not found.");
  if (args.id===ctx.person._id&&!args.active) throw new ConvexError("You cannot deactivate your own account.");
  const duplicate=await ctx.db.query("staff").withIndex("by_email",q=>q.eq("email",address)).unique();
  if (duplicate&&duplicate._id!==args.id) throw new ConvexError("A staff member already uses that email.");
  if (existing?.roles.includes("admin")&&(!args.active||!args.roles.includes("admin"))) {
    const active=await ctx.db.query("staff").withIndex("by_active",q=>q.eq("active",true)).take(201);
    if (!active.some(p=>p._id!==args.id&&p.roles.includes("admin")&&p.userId)) throw new ConvexError("Keep at least one activated Administrator.");
  }
  let id=args.id;
  const values={name,email:address,roles:[...new Set(args.roles)],active:args.active};
  if (!existing?.userId) {
    const loginDuplicate=await ctx.db.query("staff").withIndex("by_loginEmail",q=>q.eq("loginEmail",address)).unique();
    if(loginDuplicate&&loginDuplicate._id!==id) throw new ConvexError("That sign-in email is already registered.");
  }
  if (id) await ctx.db.patch(id,{...values,...(!existing?.userId?{loginEmail:address}:{})});
  else {
    if ((await ctx.db.query("staff").take(200)).length>=200) throw new ConvexError("This workspace supports up to 200 staff accounts.");
    id=await ctx.db.insert("staff",{...values,loginEmail:address});
  }
  await log(ctx,ctx.person._id,"staff",id,`${existing?"Updated":"Added"} staff member ${name}`);
  return id;
}});
export const profile=staffMutation({args:{name:v.string(),email:v.string()},returns:v.null(),handler:async(ctx,args)=>{
  const name=text(args.name,"Name",120),address=email(args.email);
  const duplicate=await ctx.db.query("staff").withIndex("by_email",q=>q.eq("email",address)).unique();
  if(duplicate&&duplicate._id!==ctx.person._id) throw new ConvexError("A staff member already uses that email.");
  await ctx.db.patch(ctx.person._id,{name,email:address});
  await ctx.db.patch(ctx.person.userId!,{name});
  await log(ctx,ctx.person._id,"staff",ctx.person._id,"Updated own profile");
  return null;
}});
export const invite=staffMutation({args:{id:v.id("staff")},returns:v.string(),handler:async(ctx,{id})=>{
  requirePermission(ctx.person,"staff:manage");
  const person=await ctx.db.get(id);
  if(!person?.active||person.userId) throw new ConvexError("Choose an active staff account that has not been activated.");
  for(const old of await ctx.db.query("invitations").withIndex("by_staffId",q=>q.eq("staffId",id)).take(10)) await ctx.db.delete(old._id);
  const token=crypto.randomUUID()+crypto.randomUUID();
  await ctx.db.insert("invitations",{staffId:id,hash:await hash(token),expiresAt:Date.now()+7*86400000});
  return token;
}});
