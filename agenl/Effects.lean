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
  blocked : List String

def toolName : ToolEffect α → String
  | .ReadFile  _ => "read_file"
  | .QueryDB   _ => "query_db"
  | .SendEmail _ => "send_email"
  | .Escalate  _ => "escalate"
  | .RunPython _ => "run_python"
