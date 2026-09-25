module

public import Mathlib.Logic.Function.Basic

/-!
# Query-relative canonical signatures

This file packages a family of queries as one signature. A representation is
sufficient for that family when the signature factors through the
representation in the sense of `Function.FactorsThrough`.

Exactness below means equality of the partitions induced by a signature and a
representation. It does not assert a unique encoding or data structure.
-/

namespace ZeroState

/-- The answers to every declared query at one input. -/
def querySignature {T I Q : Type*} (query : I → T → Q) : T → I → Q :=
  fun input index => query index input

/-- A representation is sufficient when it preserves the complete signature. -/
def SignatureSufficient {T I Q A : Type*}
    (query : I → T → Q) (representation : T → A) : Prop :=
  (querySignature query).FactorsThrough representation

/-- Every component query factors through the complete query signature. -/
theorem component_factorsThrough_querySignature
    {T I Q : Type*} (query : I → T → Q) (index : I) :
    (query index).FactorsThrough (querySignature query) := by
  intro x y hsignature
  exact congrFun hsignature index

/-- Signature equality is exactly pointwise equality of all query answers. -/
theorem querySignature_eq_iff
    {T I Q : Type*} (query : I → T → Q) (x y : T) :
    querySignature query x = querySignature query y ↔
      ∀ index, query index x = query index y := by
  constructor
  · intro hsignature index
    exact congrFun hsignature index
  · intro hcomponents
    funext index
    exact hcomponents index

/--
Preserving a complete signature is equivalent to preserving each component
query separately.
-/
theorem signatureSufficient_iff_components
    {T I Q A : Type*} (query : I → T → Q)
    (representation : T → A) :
    SignatureSufficient query representation ↔
      ∀ index, (query index).FactorsThrough representation := by
  constructor
  · intro hsufficient index x y hrepresentation
    exact congrFun (hsufficient hrepresentation) index
  · intro hcomponents x y hrepresentation
    funext index
    exact hcomponents index hrepresentation

/--
A sufficient representation must distinguish inputs whose realized query
signatures differ.
-/
theorem representation_ne_of_signature_ne
    {T I Q A : Type*} {query : I → T → Q}
    {representation : T → A} (hsufficient : SignatureSufficient query representation)
    {x y : T} (hsignature : querySignature query x ≠ querySignature query y) :
    representation x ≠ representation y := by
  intro hrepresentation
  exact hsignature (hsufficient hrepresentation)

/--
A representation is exact for the declared signature when each factors through
the other. This states equality of the induced kernel partitions without
choosing labels for their classes.
-/
def SignatureExact {T I Q A : Type*}
    (query : I → T → Q) (representation : T → A) : Prop :=
  SignatureSufficient query representation ∧
    representation.FactorsThrough (querySignature query)

/-- Exactness is equality of the representation and signature kernels. -/
theorem signatureExact_iff_kernel_eq
    {T I Q A : Type*} (query : I → T → Q)
    (representation : T → A) :
    SignatureExact query representation ↔
      ∀ x y,
        representation x = representation y ↔
          querySignature query x = querySignature query y := by
  constructor
  · rintro ⟨hsufficient, hreverse⟩ x y
    exact ⟨
      fun hrepresentation => hsufficient hrepresentation,
      fun hsignature => hreverse hsignature
    ⟩
  · intro hkernel
    constructor
    · intro x y hrepresentation
      exact (hkernel x y).mp hrepresentation
    · intro x y hsignature
      exact (hkernel x y).mpr hsignature

end ZeroState
