import Mathlib.Tactic

inductive ToolEffect : Type → Type where
  | ReadFile  : String → ToolEffect String
  | QueryDB   : String → ToolEffect String
  | SendEmail : String → ToolEffect Unit
  | Escalate  : String → ToolEffect String
  | RunPython : String → ToolEffect String

inductive AgentProgram : Type → Type 1 where
  | Pure   : {α : Type} → α → AgentProgram α
  | Effect : {α β : Type} → ToolEffect α →
             (α → AgentProgram β) →
             AgentProgram β
structure AgentContract where
  name     : String
  allow    : List String
  block    : List String
  trust    : Nat
  on_error : String

def toolName : ToolEffect α → String
  | .ReadFile  _ => "read_file"
  | .QueryDB   _ => "query_db"
  | .SendEmail _ => "send_email"
  | .Escalate  _ => "escalate"
  | .RunPython _ => "run_python"
-- Allowed tools predicate
inductive SafeTool : String → Prop where
  | allowed (name : String) (h : name ∉ [] ) : SafeTool name

-- Safe program: inductive proof that no blocked tool runs
inductive SafeProg (contract : AgentContract) :
    {α : Type} → AgentProgram α → Prop where
  | pureSafe : ∀ {α : Type} (a : α),
      SafeProg contract (AgentProgram.Pure a)
  | effectSafe : ∀ {α β : Type}
      (eff : ToolEffect α)
      (k : α → AgentProgram β),
      toolName eff ∉ contract.block →
      (∀ a, SafeProg contract (k a)) →
      SafeProg contract (AgentProgram.Effect eff k)
