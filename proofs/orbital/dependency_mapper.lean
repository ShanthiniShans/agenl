import AGENL.Effects
import AGENL.InfoFlow
import AGENL.ValidAgent

def dependencyMapperContract : AgentContract := {
  name     := "DependencyMapper"
  allow    := ["query_database", "read_file",
               "browse_web", "summarise"]
  block    := ["modify_record", "delete_file",
               "send_email"]
  trust    := 1
  on_error := "escalate"
}

instance : ValidAgent dependencyMapperContract where
  no_overlap := by decide
  allow_nonempty := by decide
  trust_bounded := by decide

theorem dependency_modify_blocked :
    "modify_record" ∈
    dependencyMapperContract.block := by decide

theorem dependency_no_overlap :
    ∀ t, t ∈ dependencyMapperContract.allow →
         t ∉ dependencyMapperContract.block := by decide

theorem dependency_valid_execution :
    ∃ a : AgentContract, ValidAgent a ∧
    "modify_record" ∈ a.block ∧
    a.trust = 1 :=
  ⟨dependencyMapperContract, inferInstance,
   by decide, by decide⟩
