import AGENL.Effects
import AGENL.InfoFlow
import AGENL.ValidAgent

def scheduleAnalyserContract : AgentContract := {
  name     := "ScheduleAnalyser"
  allow    := ["query_database", "read_file", "summarise"]
  block    := ["modify_schedule", "delete_milestone",
               "send_email"]
  trust    := 1
  on_error := "escalate"
}

instance : ValidAgent scheduleAnalyserContract where
  no_overlap := by decide
  allow_nonempty := by decide
  trust_bounded := by decide

theorem schedule_modify_blocked :
    "modify_schedule" ∈
    scheduleAnalyserContract.block := by decide

theorem schedule_delete_blocked :
    "delete_milestone" ∈
    scheduleAnalyserContract.block := by decide

theorem schedule_no_overlap :
    ∀ t, t ∈ scheduleAnalyserContract.allow →
         t ∉ scheduleAnalyserContract.block := by decide

theorem schedule_valid_execution :
    ∃ a : AgentContract, ValidAgent a ∧
    "modify_schedule" ∈ a.block ∧
    a.trust = 1 :=
  ⟨scheduleAnalyserContract, inferInstance,
   by decide, by decide⟩
