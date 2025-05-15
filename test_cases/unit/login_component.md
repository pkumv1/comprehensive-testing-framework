# Login Component Unit Test Cases

## Test Case ID: UT-LOGIN-001
**Test Case Name:** Validate Username Field
**Description:** Verify that the username field properly validates input
**Preconditions:** Login component is loaded
**Test Steps:**
1. Enter various inputs into username field (valid email, invalid email, empty)
2. Check validation responses
**Expected Results:** 
- Valid emails accepted
- Invalid emails show error
- Empty field shows required error

## Test Case ID: UT-LOGIN-002
**Test Case Name:** Validate Password Field
**Description:** Verify that the password field properly validates input
**Preconditions:** Login component is loaded
**Test Steps:**
1. Enter various inputs into password field (valid, too short, empty)
2. Check validation responses
**Expected Results:**
- Valid passwords accepted
- Too short passwords show error
- Empty field shows required error

## Test Case ID: UT-LOGIN-003
**Test Case Name:** Submit Button State
**Description:** Verify submit button enables/disables based on form validity
**Preconditions:** Login component is loaded
**Test Steps:**
1. Leave form empty and check button state
2. Fill only username and check button state
3. Fill only password and check button state
4. Fill both with valid values and check button state
**Expected Results:** Button only enables when both fields have valid values