import AGENL.Effects
import AGENL.InfoFlow
import AGENL.ValidAgent

-- LaunchWindowAnalyser contract instance
def launchWindowContract : AgentContract := {
  name     := "LaunchWindowAnalyser"
  allow    := ["query_database", "browse_web",
               "run_python", "summarise"]
  block    := ["approve_launch", "modify_launch_date",
               "delete_record"]
  trust    := 0
  on_error := "stop"
}

-- ValidAgent instance
instance : ValidAgent launchWindowContract where
  no_overlap := by decide
  allow_nonempty := by decide
  trust_bounded := by decide

-- Key safety theorem: approve_launch is blocked
-- This is mathematically impossible to override
theorem launch_approval_blocked :
    "approve_launch" ∈ launchWindowContract.block := by
  decide

-- approve_launch cannot appear in allow list
theorem launch_approval_not_allowed :
    "approve_launch" ∉ launchWindowContract.allow := by
  decide

-- No tool can be in both allow and block
theorem launch_no_overlap :
    ∀ t, t ∈ launchWindowContract.allow →
         t ∉ launchWindowContract.block := by
  decide

-- Existence theorem: valid cautious execution exists
theorem launch_window_valid_execution :
    ∃ a : AgentContract, ValidAgent a ∧
    "approve_launch" ∈ a.block ∧
    a.trust = 0 :=
  ⟨launchWindowContract, inferInstance,
   by decide, by decide⟩
