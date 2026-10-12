import { createContext, useContext } from "react";
import type { WebsiteContent } from "../../../web/src/data/websiteDefaults";
import type { StaffUser, WorkspaceState, DocumentId, NewApplication } from "./types";

// Kept apart from WorkspaceProvider.tsx so hot reloads of the provider don't create a new context
// (which made useWorkspace() throw "WorkspaceProvider is missing." until a full page reload).
export type ApplicationAction = {type:"assign";userId:string}|{type:"note";text:string}|{type:"review"}|{type:"request_information";text:string}|{type:"recommend";decision:"approve"|"reject";text:string}|{type:"decide";decision:"approved"|"rejected";text:string};
export type WorkspaceValue={state:WorkspaceState;user:StaffUser;images:Record<string,string|null>;signOut:()=>Promise<void>;saveProfile:(input:Pick<StaffUser,"name"|"email">)=>Promise<unknown>;saveUser:(input:StaffUser)=>Promise<unknown>;invite:(id:string)=>Promise<string>;saveContent:(id:DocumentId,content:WebsiteContent,revision:number)=>Promise<number>;addApplication:(input:NewApplication,requestId:string)=>Promise<string>;saveApplicationDetails:(id:string,input:NewApplication,revision:number)=>Promise<unknown>;updateApplication:(id:string,action:ApplicationAction)=>Promise<unknown>;loadMore:()=>void;hasMore:boolean;loadingMore:boolean;loadingApplication:boolean;totals:{total:number;membership:number;loan:number;new:number;in_review:number;needs_information:number;recommended:number;approved:number;rejected:number}};
export const WorkspaceContext=createContext<WorkspaceValue|null>(null);

export function useWorkspace() {
  const value=useContext(WorkspaceContext);
  if(!value) throw new Error("WorkspaceProvider is missing.");
  return value;
}
