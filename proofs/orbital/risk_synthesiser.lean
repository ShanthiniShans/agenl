import AGENL.Effects
import AGENL.InfoFlow
import AGENL.ValidAgent
import AGENL.Memory

-- RiskSynthesiser contract instance
def riskSynthesiserContract : AgentContract := {
  name     := "RiskSynthesiser"
  allow    := ["query_database", "read_file",
               "run_python", "summarise"]
  block    := ["modify_risk_score", "approve_mission",
               "delete_record"]
  trust    := 0
  on_error := "escalate"
}

-- ValidAgent instance
instance : ValidAgent riskSynthesiserContract where
  no_overlap := by decide
  allow_nonempty := by decide
  trust_bounded := by decide

-- approve_mission is mathematically blocked
theorem risk_approve_mission_blocked :
    "approve_mission" ∈ riskSynthesiserContract.block := by
  decide

-- modify_risk_score is mathematically blocked
theorem risk_score_modification_blocked :
    "modify_risk_score" ∈ riskSynthesiserContract.block := by
  decide

-- no tool in both allow and block
theorem risk_no_overlap :
    ∀ t, t ∈ riskSynthesiserContract.allow →
         t ∉ riskSynthesiserContract.block := by
  decide

-- Information flow theorem:
-- combined output label is at least as high as
-- any input label — max of inputs
theorem risk_synthesis_label_monotone
    (input_label : DataLabel)
    (output_label : DataLabel)
    (h : canFlowTo input_label output_label) :
    input_label ≤ output_label := h

-- Secret input cannot produce Public output
theorem risk_no_secret_to_public :
    ¬ canFlowTo DataLabel.Secret DataLabel.Public := by
  unfold canFlowTo
  intro h
  have : dataLabelRank DataLabel.Secret ≤
         dataLabelRank DataLabel.Public := h
  simp [dataLabelRank] at this

-- existence theorem: valid synthesis execution exists
theorem risk_synthesiser_valid_execution :
    ∃ a : AgentContract, ValidAgent a ∧
    "approve_mission" ∈ a.block ∧
    "modify_risk_score" ∈ a.block ∧
    a.trust = 0 :=
  ⟨riskSynthesiserContract, inferInstance,
   by decide, by decide, by decide⟩
