import AGENL.Effects
import AGENL.ValidAgent
import proofs.orbital.mission_context_agent
import proofs.orbital.launch_window_analyser
import proofs.orbital.orbital_risk_agent
import proofs.orbital.risk_synthesiser
import proofs.orbital.escalation_coordinator
import proofs.orbital.knowledge_memory_agent

-- The full ORBITAL pipeline as a list
def orbitalPipeline : List AgentContract := [
  missionContextContract,
  launchWindowContract,
  orbitalRiskContract,
  riskSynthesiserContract,
  escalationContract,
  knowledgeMemoryContract
]

-- Pipeline validity: all agents satisfy ValidAgent
theorem orbital_pipeline_valid :
    ∀ a ∈ orbitalPipeline, ValidAgent a := by
  intro a ha
  simp [orbitalPipeline] at ha
  rcases ha with rfl | rfl | rfl |
                 rfl | rfl | rfl
  · exact inferInstance
  · exact inferInstance
  · exact inferInstance
  · exact inferInstance
  · exact inferInstance
  · exact inferInstance

-- No safety-critical action appears in any
-- agent's allow list
theorem pipeline_no_approve_in_allow :
    ∀ a ∈ orbitalPipeline,
    "approve_action" ∉ a.allow ∧
    "approve_launch" ∉ a.allow ∧
    "approve_maneuver" ∉ a.allow := by
  intro a ha
  simp [orbitalPipeline] at ha
  rcases ha with rfl | rfl | rfl |
                 rfl | rfl | rfl <;>
  constructor <;> decide
