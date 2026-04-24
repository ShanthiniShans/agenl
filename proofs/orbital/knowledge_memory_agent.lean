import AGENL.Effects
import AGENL.InfoFlow
import AGENL.ValidAgent
import AGENL.Memory

def knowledgeMemoryContract : AgentContract := {
  name     := "KnowledgeMemoryAgent"
  allow    := ["query_database", "read_file",
               "summarise", "write_file"]
  block    := ["delete_knowledge",
               "modify_historical_record",
               "approve_action"]
  trust    := 1
  on_error := "escalate"
}

instance : ValidAgent knowledgeMemoryContract where
  no_overlap := by decide
  allow_nonempty := by decide
  trust_bounded := by decide

theorem knowledge_delete_blocked :
    "delete_knowledge" ∈
    knowledgeMemoryContract.block := by
  decide

theorem knowledge_history_blocked :
    "modify_historical_record" ∈
    knowledgeMemoryContract.block := by
  decide

theorem knowledge_no_overlap :
    ∀ t, t ∈ knowledgeMemoryContract.allow →
         t ∉ knowledgeMemoryContract.block := by
  decide

theorem knowledge_valid_execution :
    ∃ a : AgentContract, ValidAgent a ∧
    "delete_knowledge" ∈ a.block ∧
    a.trust = 1 :=
  ⟨knowledgeMemoryContract, inferInstance,
   by decide, by decide⟩
