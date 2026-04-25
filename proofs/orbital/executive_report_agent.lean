import AGENL.Effects
import AGENL.InfoFlow
import AGENL.ValidAgent

def executiveReportContract : AgentContract := {
  name     := "ExecutiveReportAgent"
  allow    := ["query_database", "read_file",
               "summarise", "export_pdf"]
  block    := ["modify_data", "approve_action",
               "delete_record", "send_email"]
  trust    := 1
  on_error := "escalate"
}

instance : ValidAgent executiveReportContract where
  no_overlap := by decide
  allow_nonempty := by decide
  trust_bounded := by decide

theorem exec_approve_blocked :
    "approve_action" ∈
    executiveReportContract.block := by decide

theorem exec_send_email_blocked :
    "send_email" ∈
    executiveReportContract.block := by decide

theorem exec_no_overlap :
    ∀ t, t ∈ executiveReportContract.allow →
         t ∉ executiveReportContract.block := by decide

theorem exec_valid_execution :
    ∃ a : AgentContract, ValidAgent a ∧
    "approve_action" ∈ a.block ∧
    a.trust = 1 :=
  ⟨executiveReportContract, inferInstance,
   by decide, by decide⟩
