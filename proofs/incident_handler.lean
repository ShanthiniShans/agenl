/-!
Simple Lean 4 verification for the `IncidentHandler` AGENL contract.
This file proves:
1) allow and block lists are disjoint,
2) low trust implies on_uncertain is escalate or say_so,
3) required fields are present.
-/

inductive Trust where
  | low
  | medium
  | high
deriving DecidableEq, Repr

inductive OnUncertain where
  | escalate
  | say_so
  | best_guess
deriving DecidableEq, Repr

structure AgentContract where
  name : String
  goal : String
  persona : String
  allow : List String
  block : List String
  confirm : List String
  trust : Trust
  on_uncertain : OnUncertain
deriving Repr

def listDisjoint (xs ys : List String) : Bool :=
  not <| xs.any (fun x => x ∈ ys)

def requiredFieldsPresent (c : AgentContract) : Bool :=
  c.name != "" &&
  c.goal != "" &&
  c.persona != "" &&
  !c.allow.isEmpty &&
  !c.block.isEmpty &&
  !c.confirm.isEmpty

def lowTrustRule (c : AgentContract) : Bool :=
  if c.trust = Trust.low then
    c.on_uncertain = OnUncertain.escalate || c.on_uncertain = OnUncertain.say_so
  else
    true

def incidentHandler : AgentContract :=
  {
    name := "IncidentHandler"
    goal := "Detect, triage, and escalate system incidents with full context and never act destructively without explicit human approval"
    persona := "calm, methodical, conservative, always escalates when uncertain, documents every decision, and never rushes to action"
    allow := ["query_database", "read_file", "summarise", "browse_web", "create_ticket"]
    block := ["delete_file", "modify_config", "restart_service", "deploy_code"]
    confirm := ["send_email", "page_oncall", "rollback_deployment", "scale_infrastructure"]
    trust := Trust.low
    on_uncertain := OnUncertain.escalate
  }

theorem incident_no_allow_block_overlap :
    listDisjoint incidentHandler.allow incidentHandler.block = true := by
  native_decide

theorem incident_low_trust_uncertain_rule :
    lowTrustRule incidentHandler = true := by
  native_decide

theorem incident_required_fields_present :
    requiredFieldsPresent incidentHandler = true := by
  native_decide
