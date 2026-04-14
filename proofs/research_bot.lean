/-!
Simple Lean 4 verification for the `ResearchBot` AGENL contract.
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

def researchBot : AgentContract :=
  {
    name := "ResearchBot"
    goal := "Search the web and summarise findings on any topic"
    persona := "precise, neutral, always cites sources, never speculates"
    allow := ["web_search", "summarise", "read_file"]
    block := ["send_email", "delete_file", "write_file"]
    confirm := ["run_python"]
    trust := Trust.medium
    on_uncertain := OnUncertain.say_so
  }

theorem research_no_allow_block_overlap :
    listDisjoint researchBot.allow researchBot.block = true := by
  native_decide

theorem research_low_trust_uncertain_rule :
    lowTrustRule researchBot = true := by
  native_decide

theorem research_required_fields_present :
    requiredFieldsPresent researchBot = true := by
  native_decide
