import AGENL.Effects

-- A governor specifies which tools are permitted to run.
structure Governor where
  allowed  : List String
  nonempty : allowed ≠ []

def permitted (gov : Governor) (name : String) : Prop :=
  name ∈ gov.allowed

-- CanComplete: there exists an execution path that reaches a value.
-- Pure always terminates; Effect terminates when its tool is permitted
-- and the continuation can also complete for some result.
inductive CanComplete (gov : Governor) : {α : Type} → AgentProgram α → Prop where
  | pureCompletes :
      ∀ {α : Type} (a : α),
      CanComplete gov (AgentProgram.Pure a)
  | effectCompletes :
      ∀ {α β : Type} (eff : ToolEffect α) (k : α → AgentProgram β) (a : α),
      permitted gov (toolName eff) →
      CanComplete gov (k a) →
      CanComplete gov (AgentProgram.Effect eff k)

-- Theorem 1: Pure programs always complete under any governor.
theorem pure_always_completes
    (gov : Governor) {α : Type} (a : α) :
    CanComplete gov (AgentProgram.Pure a) :=
  CanComplete.pureCompletes a

-- Theorem 2: An Effect program governed by a non-empty allow list
-- can reach completion when its tool is permitted and the
-- continuation completes for some witness value.
theorem effect_completes_if_allowed
    (gov : Governor)
    {α β : Type}
    (eff : ToolEffect α)
    (k   : α → AgentProgram β)
    (a   : α)
    (h_permitted : permitted gov (toolName eff))
    (h_cont      : CanComplete gov (k a)) :
    CanComplete gov (AgentProgram.Effect eff k) :=
  CanComplete.effectCompletes eff k a h_permitted h_cont
