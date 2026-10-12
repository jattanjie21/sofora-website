import type { ReactNode } from "react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useLocation } from "react-router";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { defaultWebsiteContent, type WebsiteContent } from "../../../web/src/data/websiteDefaults";
import { ShellSkeleton } from "../components/Skeleton";
import { can, type StaffUser, type WorkspaceState, type NewApplication } from "./types";
import { WorkspaceContext as Context } from "./workspaceContext";

// Fills fields the backend doesn't know yet (e.g. new copy.ts rows before Convex is pushed).
const withDefaults=(content:WebsiteContent):WebsiteContent=>({...defaultWebsiteContent,...content,copy:{...defaultWebsiteContent.copy,...content.copy}});

export function WorkspaceProvider({user,children}:{user:StaffUser;children:ReactNode}) {
  const {signOut}=useAuthActions();
  const location=useLocation();
  const users=useQuery(api.staff.list);
  const content=useQuery(api.content.workspace,can(user,"content:view")?{}:"skip");
  const published=useQuery(api.content.published);
  const access=can(user,"applications:view");
  const queue=usePaginatedQuery(api.applications.list,access?{}:"skip",{initialNumItems:50});
  const requestedId=location.pathname.match(/^\/applications\/([^/]+)(?:\/edit)?$/)?.[1];
  const detail=useQuery(api.applications.detail,access&&requestedId&&requestedId!=="new"?{id:requestedId as Id<"applications">}:"skip");
  const totals=useQuery(api.applications.totals,access?{}:"skip");
  const activity=useQuery(api.applications.recentActivity);
  const saveProfile=useMutation(api.staff.profile),saveStaff=useMutation(api.staff.save),createInvite=useMutation(api.staff.invite);
  const saveContent=useMutation(api.content.save),add=useMutation(api.applications.add),save=useMutation(api.applications.save),update=useMutation(api.applications.update);
  if(!users||!published||!activity||(can(user,"content:view")&&!content)||(access&&(!totals||queue.status==="LoadingFirstPage"))) return <ShellSkeleton path={location.pathname} />;
  const applications=detail?[detail,...queue.results.filter(item=>item.id!==detail.id)]:queue.results;
  const state:WorkspaceState={users,applications,activity,content:{published:withDefaults(JSON.parse(published.content)),entries:content as WorkspaceState["content"]["entries"]??[]}};
  const applicationInput=(input:NewApplication)=>({...input,assigneeId:input.assigneeId as Id<"staff">|"",attachments:input.attachments.map(item=>({role:item.role,storageId:item.storageId as Id<"_storage">}))});
  return <Context.Provider value={{state,user,images:published.images,signOut,
    saveProfile,saveUser:({id,name,email,roles,active})=>saveStaff({...(id?{id:id as Id<"staff">}:{}),name,email,roles,active}),invite:(id)=>createInvite({id:id as Id<"staff">}),
    saveContent:(key,value,revision)=>saveContent({key,revision,content:JSON.stringify(value)}),
    addApplication:(value,requestId)=>add({input:applicationInput(value),requestId}),
    saveApplicationDetails:(id,value,revision)=>save({id:id as Id<"applications">,input:applicationInput(value),revision}),
    updateApplication:(id,action)=>update({id:id as Id<"applications">,revision:state.applications.find(a=>a.id===id)!.revision,action:action.type==="assign"?{...action,userId:action.userId as Id<"staff">|""}:action}),
    loadMore:()=>queue.loadMore(50),hasMore:queue.status==="CanLoadMore",loadingMore:queue.status==="LoadingMore",
    // An application opened by address may not be in the loaded queue yet; pages show a skeleton meanwhile.
    loadingApplication:Boolean(access&&requestedId&&requestedId!=="new"&&detail===undefined),
    totals:totals??{total:0,membership:0,loan:0,new:0,in_review:0,needs_information:0,recommended:0,approved:0,rejected:0},
  }}>{children}</Context.Provider>;
}
