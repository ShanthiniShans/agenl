import AGENL.Effects
import AGENL.InfoFlow
import AGENL.ValidAgent

def milestonePredictorContract : AgentContract := {
  name     := "MilestonePredictor"
  allow    := ["query_database", "run_python",
               "summarise"]
  block    := ["modify_milestone", "approve_completion",
               "send_email"]
  trust    := 0
  on_error := "escalate"
}

instance : ValidAgent milestonePredictorContract where
  no_overlap := by decide
  allow_nonempty := by decide
  trust_bounded := by decide

theorem milestone_approve_blocked :
    "approve_completion" ∈
    milestonePredictorContract.block := by decide

theorem milestone_modify_blocked :
    "modify_milestone" ∈
    milestonePredictorContract.block := by decide

theorem milestone_no_overlap :
    ∀ t, t ∈ milestonePredictorContract.allow →
         t ∉ milestonePredictorContract.block := by decide

theorem milestone_valid_execution :
    ∃ a : AgentContract, ValidAgent a ∧
    "approve_completion" ∈ a.block ∧
    a.trust = 0 :=
  ⟨milestonePredictorContract, inferInstance,
   by decide, by decide⟩
