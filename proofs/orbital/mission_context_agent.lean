import AGENL.Effects
import AGENL.InfoFlow
import AGENL.ValidAgent

-- MissionContextAgent contract instance
def missionContextContract : AgentContract := {
  name     := "MissionContextAgent"
  allow    := ["query_database", "read_file", "summarise"]
  block    := ["modify_mission_spec", "delete_document",
               "approve_change"]
  trust    := 1
  on_error := "escalate"
}

-- ValidAgent instance — sufficient conditions for safety
instance : ValidAgent missionContextContract where
  no_overlap := by decide
  allow_nonempty := by decide
  trust_bounded := by decide

-- Existence theorem — there is a valid read-only
-- execution following FileM pattern
theorem mission_context_valid_execution :
    ∃ a : AgentContract, ValidAgent a ∧
    a.block.length > 0 ∧
    a.allow.length > 0 :=
  ⟨missionContextContract, inferInstance,
   by decide, by decide⟩
