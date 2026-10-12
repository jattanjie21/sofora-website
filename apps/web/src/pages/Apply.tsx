import { useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../../../../convex/_generated/api";
import { useWebsite } from "../data/WebsiteContent";
import { PageHero } from "../components/ui";
import type { NewApplication } from "../../../portal/src/data/types";

export function Apply({preview=false}:{preview?:boolean}) {
  const {kind}=useParams();
  if(preview) return <div className="container section"><h1>Application preview</h1><p>Applications can only be submitted from the public website.</p></div>;
  if(kind!=="loan"&&kind!=="membership") return <div className="container section"><h1>Choose your next step</h1><Link to="/apply/membership">Join Sofora</Link> · <Link to="/apply/loan">Apply for a loan</Link></div>;
  return <ApplicationForm key={kind} kind={kind} />;
}
function ApplicationForm({kind}:{kind:"loan"|"membership"}) {
  const {loans,contact}=useWebsite();
  const [params]=useSearchParams();
  const submitApplication=useMutation(api.applications.submit);
  const [requestId]=useState(()=>crypto.randomUUID());
  const [form,setForm]=useState<Omit<NewApplication,"assigneeId">>({kind,name:"",email:"",phone:"",address:"",occupation:"",purpose:"",membershipType:"personal",product:loans.some(l=>l.id===params.get("product"))?params.get("product")!:loans[0]!.id,amount:0,months:12,memberNumber:""});
  const [consent,setConsent]=useState(false),[website,setWebsite]=useState("");
  const [pending,setPending]=useState(false),[error,setError]=useState(""),[reference,setReference]=useState("");
  function change<K extends keyof typeof form>(key:K,value:(typeof form)[K]) {setForm(previous=>({...previous,[key]:value}));}
  async function submit(event:FormEvent) {
    event.preventDefault();if(pending) return;setPending(true);setError("");
    try {const result=await submitApplication({input:{...form,assigneeId:""},requestId,consent,website});setReference(result.reference);}
    catch(error) {setError(error instanceof ConvexError&&typeof error.data==="string"?error.data:"We couldn’t submit your application. Please try again or contact Sofora.");}
    finally {setPending(false);}
  }
  if(reference) return <><PageHero eyebrow="Your next chapter" title="Application received.">Thank you, {form.name}. Our team will review your request and contact you.</PageHero><section className="container section"><div className="application-receipt" role="status"><p>Your application reference</p><strong>{reference}</strong><p>Keep this reference for any follow-up. Submitting an application does not confirm membership or loan approval.</p><Link className="btn" to="/">Back to home</Link></div></section></>;
  return <><PageHero eyebrow="Let’s take the next step" title={kind==="loan"?"Apply for a loan.":"Join the Sofora community."}>Share your details with our team. We’ll contact you about eligibility, documents and next steps.</PageHero>
    <section className="container section public-application-layout">
      <form className="public-application" onSubmit={submit}>
        <h2>Your details</h2>
        {error?<p className="application-error" role="alert">{error}</p>:null}
        <fieldset disabled={pending}>
          <div className="public-form-grid">
            <label>Full name<input autoComplete="name" required maxLength={150} value={form.name} onChange={e=>change("name",e.target.value)}/></label>
            <label>Email address<input type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={e=>change("email",e.target.value)}/></label>
            <label>Phone number<input type="tel" autoComplete="tel" required maxLength={30} value={form.phone} onChange={e=>change("phone",e.target.value)}/></label>
            <label>Occupation<input required maxLength={200} value={form.occupation} onChange={e=>change("occupation",e.target.value)}/></label>
            <label className="full-width">Residential or business address<textarea autoComplete="street-address" required maxLength={2000} rows={2} value={form.address} onChange={e=>change("address",e.target.value)}/></label>
          </div>
          <h2>{kind==="loan"?"Your loan request":"Your membership"}</h2>
          <div className="public-form-grid">
          {kind==="loan"?<>
            <label>Member number<input required maxLength={100} value={form.memberNumber} onChange={e=>change("memberNumber",e.target.value)}/></label>
            <label>Loan product<select value={form.product} onChange={e=>change("product",e.target.value)}>{loans.map(loan=><option key={loan.id} value={loan.id}>{loan.title}</option>)}</select></label>
            <label>Requested amount (GMD)<input type="number" min="0.01" max="10000000000" step="0.01" required value={form.amount||""} onChange={e=>change("amount",Number(e.target.value))}/></label>
            <label>Repayment period (months)<input type="number" min="1" max="1200" step="1" required value={form.months||""} onChange={e=>change("months",Number(e.target.value))}/></label>
          </>:<label>Membership type<select value={form.membershipType} onChange={e=>change("membershipType",e.target.value as typeof form.membershipType)}><option value="personal">Personal</option><option value="group">Group / business</option><option value="children">Children’s savings (parent or guardian applies)</option></select></label>}
            <label className="full-width">{kind==="loan"?"Purpose of the loan":"Reason for joining"}<textarea required maxLength={4000} rows={4} value={form.purpose} onChange={e=>change("purpose",e.target.value)}/></label>
          </div>
          <label className="application-trap" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label>
          <label className="application-consent"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I confirm these details are accurate and agree that Sofora may use them to review this application and contact me about it.</span></label>
          <button className="btn" disabled={pending}>{pending?"Submitting…":"Submit application"}</button>
        </fieldset>
      </form>
      <aside className="application-guidance"><h2>A little guidance.</h2><p>{kind==="loan"?"Our team will review your membership, request and eligibility before discussing terms. This form is not a loan offer.":"Our team will explain membership requirements and any documents needed before your membership can be confirmed."}</p><p>Please do not enter bank passwords, payment card details or identity document numbers in the free-text fields.</p><h3>Need a hand?</h3><a href={`tel:${contact.phones[0]?.replace(/\s/g,"")}`}>{contact.phones[0]}</a><a href={`mailto:${contact.email}`}>{contact.email}</a></aside>
    </section></>;
}
