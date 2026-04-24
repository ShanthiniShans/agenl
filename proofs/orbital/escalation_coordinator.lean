import AGENL.Effects
import AGENL.InfoFlow
import AGENL.ValidAgent

def escalationContract : AgentContract := {
  name     := "EscalationCoordinator"
  allow    := ["query_database", "read_file",
               "summarise", "create_ticket"]
  block    := ["modify_record", "delete_escalation",
               "approve_action"]
  trust    := 0
  on_error := "escalate"
}

instance : ValidAgent escalationContract where
  no_overlap := by decide
  allow_nonempty := by decide
  trust_bounded := by decide

theorem escalation_approve_blocked :
    "approve_action" ∈ escalationContract.block := by
  decide

theorem escalation_no_overlap :
    ∀ t, t ∈ escalationContract.allow →
         t ∉ escalationContract.block := by
  decide

theorem escalation_valid_execution :
    ∃ a : AgentContract, ValidAgent a ∧
    "approve_action" ∈ a.block ∧
    a.trust = 0 :=
  ⟨escalationContract, inferInstance,
   by decide, by decide⟩
