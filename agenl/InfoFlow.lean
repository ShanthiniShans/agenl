import Mathlib.Order.Basic
import Mathlib.Tactic

inductive DataLabel where
  | Public
  | Internal
  | Secret
  deriving DecidableEq, Repr

def dataLabelRank : DataLabel → Nat
  | .Public   => 0
  | .Internal => 1
  | .Secret   => 2

theorem dataLabelRank_injective :
    Function.Injective dataLabelRank := by
  intro a b h
  cases a <;> cases b <;> simp_all [dataLabelRank]

instance : LinearOrder DataLabel :=
  LinearOrder.lift' dataLabelRank dataLabelRank_injective

def canFlowTo (a b : DataLabel) : Prop := a ≤ b

theorem secret_cannot_flow_to_public :
    ¬ canFlowTo DataLabel.Secret DataLabel.Public := by
  unfold canFlowTo
  intro h
  have : dataLabelRank DataLabel.Secret ≤
         dataLabelRank DataLabel.Public := h
  simp [dataLabelRank] at this

theorem flow_transitive {a b c : DataLabel} :
    canFlowTo a b → canFlowTo b c → canFlowTo a c :=
  le_trans

structure LabelledData where
  value : String
  label : DataLabel
  deriving DecidableEq, Repr

theorem secret_item_not_public
    (d : LabelledData)
    (h : d.label = DataLabel.Secret) :
    d.label = DataLabel.Public → False := by
  intro heq
  rw [h] at heq
  exact absurd heq (by decide)

theorem all_public_excludes_secret
    (output : List LabelledData)
    (hpub : ∀ d ∈ output, d.label = DataLabel.Public)
    (item : LabelledData)
    (hmem : item ∈ output) :
    item.label = DataLabel.Secret → False := by
  intro hSecret
  have heq := hpub item hmem
  rw [hSecret] at heq
  exact absurd heq (by decide)
