import AGENL.Effects
import AGENL.InfoFlow
import AGENL.ValidAgent

def delayRiskContract : AgentContract := {
  name     := "DelayRiskDetector"
  allow    := ["query_database", "read_file",
               "summarise", "browse_web"]
  block    := ["modify_record", "delete_file",
               "approve_action"]
  trust    := 0
  on_error := "escalate"
}

instance : ValidAgent delayRiskContract where
  no_overlap := by decide
  allow_nonempty := by decide
  trust_bounded := by decide

theorem delay_approve_blocked :
    "approve_action" ∈
    delayRiskContract.block := by decide

theorem delay_no_overlap :
    ∀ t, t ∈ delayRiskContract.allow →
         t ∉ delayRiskContract.block := by decide

theorem delay_valid_execution :
    ∃ a : AgentContract, ValidAgent a ∧
    "approve_action" ∈ a.block ∧
    a.trust = 0 :=
  ⟨delayRiskContract, inferInstance,
   by decide, by decide⟩
