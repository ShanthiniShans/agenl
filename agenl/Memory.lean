import AGENL.InfoFlow

structure MemoryEntry where
  value : String
  label : DataLabel
  deriving DecidableEq, Repr

abbrev AgentMemory := List MemoryEntry

-- Theorem 1: Filtering for Public entries never yields a Secret entry.
-- Proof: the filter condition gives e.label = Public via beq_iff_eq;
-- rewriting into the goal leaves Public ≠ Secret, closed by decide.
theorem public_filter_no_secret
    (mem : AgentMemory) :
    ∀ e ∈ mem.filter (fun e => e.label == DataLabel.Public),
    e.label ≠ DataLabel.Secret := by
  intro e he
  have ⟨_, hb⟩ := List.mem_filter.mp he
  simp only [beq_iff_eq] at hb
  rw [hb]
  decide

-- Theorem 2: Prepending a Public entry does not introduce new Secret
-- membership — the set of Secret entries in memory is unchanged.
-- Proof: the only new member is `entry`, whose label is Public ≠ Secret,
-- so the forward direction reaches a contradiction via rw + decide.
theorem add_public_preserves_secrets
    (mem : AgentMemory)
    (entry : MemoryEntry)
    (hpub : entry.label = DataLabel.Public)
    (e : MemoryEntry)
    (hsec : e.label = DataLabel.Secret) :
    e ∈ (entry :: mem) ↔ e ∈ mem := by
  simp only [List.mem_cons]
  constructor
  · rintro (heq | hmem)
    · rw [← heq] at hpub
      rw [hsec] at hpub
      exact absurd hpub (by decide)
    · exact hmem
  · exact Or.inr
