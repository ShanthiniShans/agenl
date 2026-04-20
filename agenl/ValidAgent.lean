import Mathlib.Tactic
import AGENL.Effects
import AGENL.Liveness
import AGENL.InfoFlow
import AGENL.Memory

-- A tool name is just a string
abbrev ToolName := String

-- Validity typeclass following Siddhartha's guidance.
-- Composition is a defining property.
class ValidAgent (a : AgentContract) : Prop where
  no_overlap     : ∀ t, t ∈ a.allow → t ∉ a.block
  allow_nonempty : a.allow ≠ []
  trust_bounded  : a.trust ≤ 2

-- Pipeline validity follows from all agents
-- satisfying ValidAgent
class ValidPipeline (agents : List AgentContract) : Prop where
  all_valid : ∀ a ∈ agents, ValidAgent a
  composes  : ∀ a ∈ agents, ∀ b ∈ agents,
              a.allow ∩ b.block = []
