import {
  registrationFormSchema,
  childSchema,
  fatherSchema,
  motherSchema,
  healthSchema,
  documentTypeSchema,
  type RegistrationFormData,
} from "../schemas/formSchema.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
assert.equal = (a: unknown, b: unknown, message: string) => {
  if (a !== b) throw new Error(`${message}: ${a} !== ${b}`);
};
assert.ok = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

console.log("Running formSchema validation tests...");

const validSample: RegistrationFormData = {
  child: {
    full_name: "Ahmad Zaki",
    nickname: "Zaki",
    nik: "1234567890123456",
    birth_place: "Duri",
    birth_date: "2021-05-15",
    gender: "laki_laki",
    child_order: 1,
    sibling_count: 2,
    address: "Jl. Mawar No. 12, Duri, Mandau",
    program: "2_tahun",
  },
  father: {
    full_name: "Budi Santoso",
    nik: "1234567890123457",
    birth_place: "Pekanbaru",
    birth_date: "1990-08-20",
    last_education: "S1",
    occupation: "Karyawan Swasta",
    monthly_income: "Rp 5.000.000 - Rp 10.000.000",
    whatsapp_number: "081234567890",
    address: "Jl. Mawar No. 12, Duri, Mandau",
  },
  mother: {
    full_name: "Siti Rahma",
    nik: "1234567890123458",
    birth_place: "Bukittinggi",
    birth_date: "1992-03-12",
    last_education: "D3",
    occupation: "Ibu Rumah Tangga",
    whatsapp_number: "6281987654321",
    address: "Jl. Mawar No. 12, Duri, Mandau",
  },
  health: {
    weight_kg: 18.5,
    height_cm: 105,
    blood_type: "O",
    allergy_history: "Alergi udang",
    disease_history: "",
  },
};

// 1. Full schema validation
{
  const result = registrationFormSchema.safeParse(validSample);
  assert.ok(result.success, "Valid complete registration form should succeed");
  if (result.success) {
    assert.equal(result.data.health.disease_history, undefined, "Empty string optional should transform to undefined");
  }
}

// 2. Child section validation
{
  const validChild = childSchema.safeParse(validSample.child);
  assert.ok(validChild.success, "Valid child data should pass childSchema");

  // Invalid NIK
  const invalidNik = childSchema.safeParse({ ...validSample.child, nik: "12345" });
  assert.equal(invalidNik.success, false, "Child NIK < 16 digits should fail");

  const letterNik = childSchema.safeParse({ ...validSample.child, nik: "123456789012345A" });
  assert.equal(letterNik.success, false, "Child NIK with letters should fail");

  // Invalid gender
  const invalidGender = childSchema.safeParse({ ...validSample.child, gender: "other" });
  assert.equal(invalidGender.success, false, "Invalid gender should fail");

  // Invalid program
  const invalidProgram = childSchema.safeParse({ ...validSample.child, program: "3_tahun" });
  assert.equal(invalidProgram.success, false, "Invalid program should fail");

  // Number coercion
  const coerced = childSchema.safeParse({ ...validSample.child, child_order: "2", sibling_count: "0" });
  assert.ok(coerced.success, "String numbers for child_order and sibling_count should coerce");
  if (coerced.success) {
    assert.equal(coerced.data.child_order, 2, "Coerced child_order should be number 2");
    assert.equal(coerced.data.sibling_count, 0, "Coerced sibling_count should be number 0");
  }
}

// 3. Parent section validation (Father & Mother)
{
  const validFather = fatherSchema.safeParse(validSample.father);
  assert.ok(validFather.success, "Valid father data should pass fatherSchema");

  const validMother = motherSchema.safeParse(validSample.mother);
  assert.ok(validMother.success, "Valid mother data should pass motherSchema");

  // Invalid phone number
  const invalidPhone = fatherSchema.safeParse({ ...validSample.father, whatsapp_number: "12345" });
  assert.equal(invalidPhone.success, false, "Invalid father whatsapp should fail");

  // Optional monthly income omitted or empty string
  const noIncome = fatherSchema.safeParse({ ...validSample.father, monthly_income: "" });
  assert.ok(noIncome.success, "Empty string monthly_income should pass");
  if (noIncome.success) {
    assert.equal(noIncome.data.monthly_income, undefined, "Empty string monthly_income becomes undefined");
  }
}

// 4. Health section validation
{
  const validHealth = healthSchema.safeParse(validSample.health);
  assert.ok(validHealth.success, "Valid health data should pass healthSchema");

  // Negative weight
  const negWeight = healthSchema.safeParse({ ...validSample.health, weight_kg: -5 });
  assert.equal(negWeight.success, false, "Negative weight should fail");

  // Zero weight
  const zeroWeight = healthSchema.safeParse({ ...validSample.health, weight_kg: 0 });
  assert.equal(zeroWeight.success, false, "Zero weight should fail");

  // Number coercion for weight and height strings
  const coercedHealth = healthSchema.safeParse({
    ...validSample.health,
    weight_kg: "19.2",
    height_cm: "110",
    blood_type: "",
    allergy_history: undefined,
  });
  assert.ok(coercedHealth.success, "String numbers for health should coerce");
  if (coercedHealth.success) {
    assert.equal(coercedHealth.data.weight_kg, 19.2, "Coerced weight should be 19.2");
    assert.equal(coercedHealth.data.height_cm, 110, "Coerced height should be 110");
    assert.equal(coercedHealth.data.blood_type, undefined, "Empty blood_type should be undefined");
  }
}

// 5. Document Type Enum
{
  const validDocs = ["kartu_keluarga", "akte_kelahiran"];
  for (const doc of validDocs) {
    assert.ok(documentTypeSchema.safeParse(doc).success, `Document type ${doc} should be valid`);
  }
  assert.equal(documentTypeSchema.safeParse("pas_foto").success, false, "pas_foto should not be in documentTypeSchema");
  assert.equal(documentTypeSchema.safeParse("ijazah").success, false, "Unknown document type should fail");
}

console.log("All formSchema validation tests passed successfully!");
