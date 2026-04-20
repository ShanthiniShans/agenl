import AGENL.Effects
import AGENL.InfoFlow
import AGENL.ValidAgent

-- OrbitalRiskAgent contract instance
def orbitalRiskContract : AgentContract := {
  name     := "OrbitalRiskAgent"
  allow    := ["query_database", "browse_web",
               "run_python", "summarise"]
  block    := ["modify_orbit_plan", "approve_maneuver",
               "delete_record"]
  trust    := 0
  on_error := "escalate"
}

-- ValidAgent instance
instance : ValidAgent orbitalRiskContract where
  no_overlap := by decide
  allow_nonempty := by decide
  trust_bounded := by decide

-- approve_maneuver is mathematically blocked
theorem orbital_maneuver_blocked :
    "approve_maneuver" ∈ orbitalRiskContract.block := by
  decide

-- orbit plan cannot be modified
theorem orbital_plan_modification_blocked :
    "modify_orbit_plan" ∈ orbitalRiskContract.block := by
  decide

-- no tool in both allow and block
theorem orbital_no_overlap :
    ∀ t, t ∈ orbitalRiskContract.allow →
         t ∉ orbitalRiskContract.block := by
  decide

-- existence theorem: valid vigilant execution exists
theorem orbital_risk_valid_execution :
    ∃ a : AgentContract, ValidAgent a ∧
    "approve_maneuver" ∈ a.block ∧
    "modify_orbit_plan" ∈ a.block ∧
    a.trust = 0 :=
  ⟨orbitalRiskContract, inferInstance,
   by decide, by decide, by decide⟩
