const pool = require("../config/db");

// Get all blood groups
const getAllBloodGroups = async () => {
  try {
    const query = `
      SELECT
        id,
        blood_group,
        order_number,
        created_at
      FROM blood_groups
      ORDER BY order_number ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get blood group by ID
const getBloodGroupById = async (bloodGroupId) => {
  try {
    const query = `
      SELECT
        id,
        blood_group,
        order_number,
        created_at
      FROM blood_groups
      WHERE id = $1
    `;
    const result = await pool.query(query, [bloodGroupId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Create a new blood group
const createBloodGroup = async (bloodGroup) => {
  try {
    // Get the next order number automatically
    const maxOrderResult = await pool.query(
      "SELECT MAX(order_number) as max_order FROM blood_groups"
    );
    const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

    const query = `
      INSERT INTO blood_groups (blood_group, order_number, created_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id, blood_group, order_number, created_at
    `;
    const result = await pool.query(query, [bloodGroup, nextOrder]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Update a blood group
const updateBloodGroup = async (bloodGroupId, bloodGroup) => {
  try {
    const query = `
      UPDATE blood_groups
      SET blood_group = $1
      WHERE id = $2
      RETURNING id, blood_group, order_number, created_at
    `;
    const result = await pool.query(query, [bloodGroup, bloodGroupId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Delete a blood group
const deleteBloodGroup = async (bloodGroupId) => {
  try {
    const query = `
      DELETE FROM blood_groups
      WHERE id = $1
      RETURNING id, blood_group, order_number
    `;
    const result = await pool.query(query, [bloodGroupId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

module.exports = {
  getAllBloodGroups,
  getBloodGroupById,
  createBloodGroup,
  updateBloodGroup,
  deleteBloodGroup,
};

// CREATE EXAMS

// POST

// http://localhost:4002/api/v1/academic/admin/exams

// {
//   "exam_name": "Mid-Term Examination",
//   "academic_year": "2025-2026",
//   "start_date": "2026-04-06",
//   "end_date": "2026-04-15",
//   "details": [
//     {
//       "class_id": "060c477b-b591-49ec-a6b9-0382c77764d6",
//       "section_id": "79a5a60a-5b47-4322-8bff-07c77f19c377",
//       "subject_name": "Mathematics",
//       "exam_date": "2026-04-07",
//       "max_marks": 100,
//       "pass_marks": 40,
//       "teacher_id": "7a2a8a97-a715-4166-b406-12878fe1eae2"
//     }
//   ]
// }

// http://localhost:4002/api/v1/academic/admin/subject-assign

// {
//     "success": true,
//     "message": "Subjects retrieved successfully",
//     "data": [
//         {
//             "id": "2e9af015-ca3f-42c6-9f38-fc9f1c45022b",
//             "subject_name": "Tamil",
//             "class_count": 0,
//             "class_display": "",
//             "assignments": [],
//             "created_at": "2026-04-14 04:45 PM",
//             "updated_at": "2026-04-14 04:45 PM"
//         },
//         {
//             "id": "e2be3be8-ab72-4fbc-9477-84e5ac8858ca",
//             "subject_name": "Science",
//             "class_count": 2,
//             "class_display": "Nursery, LKG",
//             "assignments": [
//                 {
//                     "assignment_id": "b235eef7-ec65-4250-a747-9cf592aaf3a3",
//                     "class_id": "037a5aa2-5ba7-408a-94c9-6c2588c9e028",
//                     "class_name": "Nursery",
//                     "teacher_id": "6a73ede3-12e7-4efd-a292-b8563257967b",
//                     "teacher_name": "jerin",
//                     "created_at": "2026-04-14T14:37:39.699239+05:30",
//                     "updated_at": "2026-04-14T14:37:39.699239+05:30"
//                 },
//                 {
//                     "assignment_id": "a53b54ce-fb7b-42d4-8ce0-7f26ffa279a6",
//                     "class_id": "4bc3f3a3-3364-4b5d-a8ad-b6304d04b564",
//                     "class_name": "LKG",
//                     "teacher_id": "6a73ede3-12e7-4efd-a292-b8563257967b",
//                     "teacher_name": "jerin",
//                     "created_at": "2026-04-14T14:37:39.699239+05:30",
//                     "updated_at": "2026-04-14T14:37:39.699239+05:30"
//                 }
//             ],
//             "created_at": "2026-04-14 02:37 PM",
//             "updated_at": "2026-04-14 02:37 PM"
//         },
//         {
//             "id": "6d834a07-1b06-4e70-bf69-fb0e104f562a",
//             "subject_name": "Maths",
//             "class_count": 2,
//             "class_display": "LKG, UKG",
//             "assignments": [
//                 {
//                     "assignment_id": "8cfe0888-5aa7-42e0-9289-bb5cb8ee3a5f",
//                     "class_id": "4bc3f3a3-3364-4b5d-a8ad-b6304d04b564",
//                     "class_name": "LKG",
//                     "teacher_id": "6a73ede3-12e7-4efd-a292-b8563257967b",
//                     "teacher_name": "jerin",
//                     "created_at": "2026-04-14T13:13:40.313595+05:30",
//                     "updated_at": "2026-04-14T13:13:40.313595+05:30"
//                 },
//                 {
//                     "assignment_id": "7008d1aa-db8d-4010-8df9-51905c9fbc93",
//                     "class_id": "1ef013c0-1960-49a5-b2ff-a760b1b58177",
//                     "class_name": "UKG",
//                     "teacher_id": "6a73ede3-12e7-4efd-a292-b8563257967b",
//                     "teacher_name": "jerin",
//                     "created_at": "2026-04-14T13:13:40.313595+05:30",
//                     "updated_at": "2026-04-14T13:13:40.313595+05:30"
//                 }
//             ],
//             "created_at": "2026-04-14 01:13 PM",
//             "updated_at": "2026-04-14 01:13 PM"
//         }
//     ]
// }

// solve this issues if i create exams click working but why extra fetch
// again  in

// subjec-assign get api why duplicate show from exam   this is another format

// if i create exams don't fetch subject assign list i already have another post api
// http://localhost:4002/api/v1/academic/admin/subject-assign
