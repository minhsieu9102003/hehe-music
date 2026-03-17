// ═══════════════════════════════════════════════════
// Access Control — Service code comparison (CakePHP ↔ Node.js)
// Scalable: thêm file mới bằng cách push vào TOPICS array
// ═══════════════════════════════════════════════════

export const ACCESS_CONTROL_CATEGORY = {
    id: "access-control",
    title: "Access Control Services",
    icon: "lock",
    topics: [
        // ─────────────────────────────────────────────
        // 1. EmployeeSearchQueryService
        // ─────────────────────────────────────────────
        {
            id: "ac-employee-search",
            title: "EmployeeSearch QueryService",
            tags: ["Access Control", "Employee", "PersonalProfile"],
            content: [
                { type: "text", value: "Chuyển đổi category key + item key thành ID. Dùng khi cần xác định item nào trong Personal Profile đang được phân quyền." },
                {
                    type: "codetabs", label: "getPersonalProfileItems",
                    desc: "Lấy danh sách items từ category key + item key, trả về nhóm theo categoryGroupId.",
                    php: `// AccessControlEmployeeSearchQueryService.php
public function getPersonalProfileItems(array $itemKeysByCategoryKey): array
{
    $model = ClassRegistry::init([
        'class' => 'PpPersonalProfileItem', 'alias' => 'i'
    ]);
    $options = [
        'fields' => [
            'c.pp_personal_profile_category_group_id',
            'i.pp_personal_profile_category_id',
            'i.id', 'i.key',
        ],
        'joins' => [[
            'type' => 'inner',
            'table' => 'pp_personal_profile_categories',
            'alias' => 'c',
            'conditions' => ['c.id = i.pp_personal_profile_category_id'],
        ]],
        'conditions' => ['i.is_use' => 1, 'c.is_use' => 1],
    ];
    // Build OR conditions per category key
    foreach ($itemKeysByCategoryKey as $catKey => $itemKeys) {
        $cond = ['c.key' => $catKey];
        foreach ($itemKeys as $ik) $cond['OR'][]['i.key'] = $ik;
        $options['conditions']['OR'][] = $cond;
    }
    $records = $model->find('all', $options);
    // Group by categoryGroupId
    $result = [];
    foreach ($records as $r) {
        $gid = $r['c']['pp_personal_profile_category_group_id'];
        $result[$gid][] = [
            'categoryId' => $r['i']['pp_personal_profile_category_id'],
            'itemId' => $r['i']['id'],
            'itemKey' => $r['i']['key'],
        ];
    }
    return $result;
}`,
                    js: `// accessControlEmployeeSearchService.js
const Item = require('../models/PpPersonalProfileItem');
const Category = require('../models/PpPersonalProfileCategory');

async function getPersonalProfileItems(itemKeysByCategoryKey) {
  if (!Object.keys(itemKeysByCategoryKey).length) return {};

  // Build query: OR of (categoryKey + itemKeys)
  const orConditions = Object.entries(itemKeysByCategoryKey)
    .map(([catKey, itemKeys]) => ({
      'category.key': catKey,
      key: { $in: itemKeys },
    }));

  const records = await Item.aggregate([
    { $match: { is_use: 1, $or: orConditions } },
    {
      $lookup: {
        from: 'pp_personal_profile_categories',
        localField: 'pp_personal_profile_category_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    { $match: { 'category.is_use': 1 } },
    { $sort: {
        'category.pp_personal_profile_category_group_id': 1,
        'category._id': 1,
        '_id': 1,
    }},
  ]);

  // Group by categoryGroupId
  const result = {};
  for (const r of records) {
    const gid = r.category.pp_personal_profile_category_group_id;
    if (!result[gid]) result[gid] = [];
    result[gid].push({
      categoryId: r.pp_personal_profile_category_id,
      itemId: r._id,
      itemKey: r.key,
    });
  }
  return result;
}

module.exports = { getPersonalProfileItems };`
                },
            ],
        },

        // ─────────────────────────────────────────────
        // 2. RegistrationQueryService
        // ─────────────────────────────────────────────
        {
            id: "ac-registration",
            title: "Registration QueryService",
            tags: ["Access Control", "Permission", "Employee"],
            content: [
                { type: "text", value: "Xác định danh sách employee IDs mà user hiện tại có quyền xem/sửa, dựa trên ability settings. Phân biệt quyền 'xem' (bất kỳ value) và 'sửa' (value = '20')." },
                {
                    type: "codetabs", label: "getTargetEmployeeIds",
                    desc: "Lấy danh sách employee mà user có quyền xem cho 1 item cụ thể. Kết hợp quyền 'other' (từ policy) + quyền 'self' (bản thân).",
                    php: `// AccessControlRegistrationQueryService.php
public static function getTargetEmployeeIds(int $itemId): array
{
    $category = ResourceCategory::EMPLOYEE_INFORMATION;
    $employeeIds = self::findTargetEmployeeIds($category, (string)$itemId);

    $loginEmployeeLegacyId = (string)UserSingleton::getInstance()
        ->getEmployee()->getLegacyId();

    // Bỏ bản thân khỏi danh sách (xử lý riêng)
    $employeeIds = array_diff($employeeIds, [$loginEmployeeLegacyId]);

    if (self::isAuthoritySelf($category, (string)$itemId)) {
        $employeeIds[] = $loginEmployeeLegacyId;
    }
    return $employeeIds;
}

// Query từ bảng actor_other_targets + ability
private static function findTargetEmployeeIds($category, $itemId): array
{
    $model = ClassRegistry::init('PpAccessControlPolicyActorOtherTarget');
    $records = $model->find('all', [
        'fields' => ['content'],
        'joins' => [[
            'type' => 'inner',
            'table' => 'pp_access_control_setting_policy_abilities',
            'alias' => 'pa',
            'conditions' => ['pa.target_id = PpAccessControlPolicyActorOtherTarget.target_id'],
        ]],
        'conditions' => [
            'pp_employee_id' => UserSingleton::getInstance()->getEmployeeId()->getValue(),
            'pa.category_key' => $category,
            "pa.content->'$.\\"$itemId\\"' is not null",
        ],
    ]);
    $ids = [];
    foreach ($records as $r) {
        $content = json_decode($r['PpAccessControlPolicyActorOtherTarget']['content'], true);
        $ids = array_unique(array_merge($ids, $content));
    }
    return $ids;
}`,
                    js: `// accessControlRegistrationService.js
const OtherTarget = require('../models/PpAccessControlPolicyActorOtherTarget');
const Ability = require('../models/PpAccessControlSettingPolicyAbility');
const { getAbilityValue } = require('./abilityRepository');

async function getTargetEmployeeIds(itemId, loginUser) {
  const category = 'employeeInformation';
  const empIds = await findTargetEmployeeIds(category, itemId, loginUser);

  const selfId = String(loginUser.legacyId);
  // Bỏ bản thân khỏi danh sách
  const filtered = empIds.filter(id => id !== selfId);

  // Kiểm tra quyền self
  const selfAbility = await getAbilityValue(
    loginUser.employeeId, loginUser.employeeId,
    category, null, String(itemId)
  );
  if (selfAbility !== null) filtered.push(selfId);

  return filtered;
}

async function findTargetEmployeeIds(category, itemId, loginUser) {
  // Tìm target_ids có ability cho item này
  const abilityTargetIds = await Ability.distinct('target_id', {
    category_key: category,
    [\`content.\${itemId}\`]: { $exists: true },
  });

  // Tìm content (danh sách employee IDs) từ other_targets
  const records = await OtherTarget.find({
    pp_employee_id: loginUser.employeeId,
    target_id: { $in: abilityTargetIds },
  }).lean();

  const ids = new Set();
  for (const r of records) {
    const content = r.content || []; // JSON array of legacy IDs
    content.forEach(id => ids.add(id));
  }
  return [...ids];
}

module.exports = { getTargetEmployeeIds };`
                },
            ],
        },

        // ─────────────────────────────────────────────
        // 3. PolicyQueryService — getEmployeeNames
        // ─────────────────────────────────────────────
        {
            id: "ac-policy-employee",
            title: "PolicyQuery — Employee & Department",
            tags: ["Access Control", "Policy", "Employee"],
            content: [
                { type: "text", value: "Các hàm truy vấn thông tin nhân viên, phòng ban, master data phục vụ hiển thị trên UI setting policy." },
                {
                    type: "codetabs", label: "getEmployeeNames",
                    desc: "Lấy tên nhân viên + mã nhân viên từ danh sách IDs.",
                    php: `// AccessControlPolicyQueryService.php
public function getEmployeeNames(array $employeeIds): array
{
    $model = ClassRegistry::init(['class' => 'PpEmployeeBasic', 'alias' => 't']);
    $records = $model->find('all', [
        'fields' => ['t.pp_employee_id', 't.last_name', 't.first_name', 'emp.employee_code'],
        'joins' => [[
            'type' => 'inner',
            'table' => 'pp_employee_employments',
            'alias' => 'emp',
            'conditions' => ['emp.pp_employee_id = t.pp_employee_id'],
        ]],
        'conditions' => ['t.pp_employee_id' => $employeeIds],
    ]);
    return array_map(function ($r) {
        return [
            'value' => $r['t']['pp_employee_id'],
            'code'  => $r['emp']['employee_code'],
            'name'  => "{$r['t']['last_name']} {$r['t']['first_name']}",
        ];
    }, $records);
}`,
                    js: `// accessControlPolicyService.js
const EmployeeBasic = require('../models/PpEmployeeBasic');

async function getEmployeeNames(employeeIds) {
  const records = await EmployeeBasic.aggregate([
    { $match: { pp_employee_id: { $in: employeeIds } } },
    {
      $lookup: {
        from: 'pp_employee_employments',
        localField: 'pp_employee_id',
        foreignField: 'pp_employee_id',
        as: 'emp',
      },
    },
    { $unwind: '$emp' },
  ]);

  return records.map(r => ({
    value: r.pp_employee_id,
    code: r.emp.employee_code,
    name: \`\${r.last_name} \${r.first_name}\`,
  }));
}

module.exports = { getEmployeeNames };`
                },
                {
                    type: "codetabs", label: "getDepartmentNames",
                    desc: "Lấy tên phòng ban từ unit_histories, lọc theo date range hiện tại.",
                    php: `public function getDepartmentNames(array $departmentIds): array
{
    $model = ClassRegistry::init(['class' => 'AppModel',
        'table' => 'unit_histories', 'alias' => 'uh']);
    $records = $model->find('all', [
        'fields' => ['uh.unit_id', 'uh.unit_cd', 'uh.unit_name'],
        'conditions' => [
            'uh.unit_id' => $departmentIds,
            'uh.start_date <= now()',
            'uh.end_date > now()',
        ],
    ]);
    return array_map(fn($r) => [
        'value' => $r['uh']['unit_id'],
        'code'  => $r['uh']['unit_cd'],
        'name'  => $r['uh']['unit_name'],
    ], $records);
}`,
                    js: `const UnitHistory = require('../models/UnitHistory');

async function getDepartmentNames(departmentIds) {
  const now = new Date();
  const records = await UnitHistory.find({
    unit_id: { $in: departmentIds },
    start_date: { $lte: now },
    end_date: { $gt: now },
  }).lean();

  return records.map(r => ({
    value: r.unit_id,
    code: r.unit_cd,
    name: r.unit_name,
  }));
}

module.exports = { getDepartmentNames };`
                },
            ],
        },

        // ─────────────────────────────────────────────
        // 4. PolicyQueryService — isApplied, getTargetConditions
        // ─────────────────────────────────────────────
        {
            id: "ac-policy-core",
            title: "PolicyQuery — Core Logic",
            tags: ["Access Control", "Policy", "Core"],
            content: [
                { type: "text", value: "Logic cốt lõi: kiểm tra employee có được apply position kengen hay không, lấy target conditions cho policy." },
                {
                    type: "codetabs", label: "isApplied",
                    desc: "Kiểm tra employee có phải 'người xem' trong bất kỳ policy nào không.",
                    php: `public function isApplied(EmployeeId $employeeId): bool
{
    $model = ClassRegistry::init('PpAccessControlPolicyActor');
    $record = $model->find('first', [
        'fields' => ['count(id) as n'],
        'conditions' => ['pp_employee_id' => $employeeId->getValue()],
    ]);
    return 0 < $record[0]['n'];
}`,
                    js: `const PolicyActor = require('../models/PpAccessControlPolicyActor');

async function isApplied(employeeId) {
  const count = await PolicyActor.countDocuments({
    pp_employee_id: employeeId,
  });
  return count > 0;
}`
                },
                {
                    type: "codetabs", label: "getTargetConditions",
                    desc: "Lấy target conditions (self/other) cho employee + targetType. JOIN 3 bảng: actors → targets → policies.",
                    php: `public function getTargetConditions(EmployeeId $empId, string $targetType): array
{
    $model = ClassRegistry::init(['class' => 'PpAccessControlPolicyActor', 'alias' => 'a']);
    $options = [
        'fields' => [
            'a.policy_id', 't.id', 't.target_type',
            't.applicable_type', 't.applicable_conditions',
            't.excludes_conditions',
            'p.can_access_enrollment_status_retirement',
        ],
        'joins' => [
            ['type'=>'inner','table'=>'pp_access_control_setting_policy_targets',
             'alias'=>'t','conditions'=>['t.policy_id = a.policy_id']],
            ['type'=>'inner','table'=>'pp_access_control_setting_policies',
             'alias'=>'p','conditions'=>['p.id = a.policy_id']],
        ],
        'conditions' => [
            'a.pp_employee_id' => $empId->getValue(),
            't.target_type' => $targetType,
        ],
    ];
    // Thêm affiliation flags (00~10)
    foreach (range(0, 10) as $i) {
        $idx = sprintf('%02d', $i);
        $options['fields'][] = "a.is_applicable_affiliation_$idx";
    }
    $records = $model->find('all', $options);
    return array_map(function ($r) {
        $result = [
            'policyId' => $r['a']['policy_id'],
            'targetId' => $r['t']['id'],
            'targetType' => $r['t']['target_type'],
            'applicableType' => $r['t']['applicable_type'],
            'applicableConditions' => json_decode($r['t']['applicable_conditions'], true),
            'excludesCondition' => json_decode($r['t']['excludes_conditions'], true),
            'canAccessRetirement' => $r['p']['can_access_enrollment_status_retirement'],
        ];
        foreach (range(0, 10) as $i) {
            $idx = sprintf('%02d', $i);
            $result["isApplicableAffiliation$idx"] = $r['a']["is_applicable_affiliation_$idx"];
        }
        return $result;
    }, $records);
}`,
                    js: `const PolicyActor = require('../models/PpAccessControlPolicyActor');
const PolicyTarget = require('../models/PpAccessControlSettingPolicyTarget');
const Policy = require('../models/PpAccessControlSettingPolicy');

async function getTargetConditions(employeeId, targetType) {
  // Tìm policy IDs mà employee là actor
  const actors = await PolicyActor.find({
    pp_employee_id: employeeId,
  }).lean();

  const policyIds = [...new Set(actors.map(a => a.policy_id))];

  // Tìm targets thuộc policy + đúng targetType
  const targets = await PolicyTarget.find({
    policy_id: { $in: policyIds },
    target_type: targetType,
  }).lean();

  // Lấy policy info
  const policies = await Policy.find({
    _id: { $in: policyIds },
  }).lean();
  const policyMap = Object.fromEntries(policies.map(p => [p._id, p]));

  // Map actor info (affiliation flags) theo policy
  const actorMap = {};
  for (const a of actors) {
    actorMap[a.policy_id] = a;
  }

  return targets.map(t => {
    const actor = actorMap[t.policy_id] || {};
    const policy = policyMap[t.policy_id] || {};
    const result = {
      policyId: t.policy_id,
      targetId: t._id,
      targetType: t.target_type,
      applicableType: t.applicable_type,
      applicableConditions: t.applicable_conditions, // already object in Mongo
      excludesCondition: t.excludes_conditions,
      canAccessRetirement: policy.can_access_enrollment_status_retirement,
    };
    for (let i = 0; i <= 10; i++) {
      const idx = String(i).padStart(2, '0');
      result[\`isApplicableAffiliation\${idx}\`] = actor[\`is_applicable_affiliation_\${idx}\`];
    }
    return result;
  });
}`
                },
            ],
        },

        // ─────────────────────────────────────────────
        // 5. DepartmentAsManagerQueryService
        // ─────────────────────────────────────────────
        {
            id: "ac-dept-manager",
            title: "DepartmentAsManager QueryService",
            tags: ["Access Control", "Organization"],
            content: [
                { type: "text", value: "Tìm danh sách phòng ban mà employee là sở thuộc trưởng (manager). JOIN pp_employees → unit_managers, lọc theo date range." },
                {
                    type: "codetabs", label: "getDepartmentIds",
                    desc: "Trả về mảng unit_id mà employee là manager, trong thời điểm hiện tại.",
                    php: `// DepartmentAsManagerQueryService.php
public function getDepartmentIds(string $employeeId): array
{
    $model = ClassRegistry::init(['class' => 'UnitManager', 'alias' => 'um']);
    $date = Date::now('Y-m-d')->getValue();
    $records = $model->find('all', [
        'fields' => ['um.unit_id'],
        'joins' => [[
            'type' => 'inner',
            'table' => 'pp_employees',
            'alias' => 'e',
            'conditions' => ['e.employee_id = um.manager_id'],
        ]],
        'conditions' => [
            'e.id' => $employeeId,
            'um.start_date <=' => $date,
            'um.end_date >' => $date,
        ],
    ]);
    return array_map(fn($r) => (string)$r['um']['unit_id'], $records);
}`,
                    js: `const UnitManager = require('../models/UnitManager');
const PpEmployee = require('../models/PpEmployee');

async function getDepartmentIds(employeeId) {
  // Lấy legacy employee_id
  const emp = await PpEmployee.findById(employeeId).lean();
  if (!emp) return [];

  const now = new Date();
  const records = await UnitManager.find({
    manager_id: emp.employee_id,
    start_date: { $lte: now },
    end_date: { $gt: now },
  }).lean();

  return records.map(r => String(r.unit_id));
}

module.exports = { getDepartmentIds };`
                },
            ],
        },

        // ─────────────────────────────────────────────
        // 6. ResourceCategoryQueryService
        // ─────────────────────────────────────────────
        {
            id: "ac-resource-category",
            title: "ResourceCategory QueryService",
            tags: ["Access Control", "Config"],
            content: [
                { type: "text", value: "Kiểm tra một resource category có được apply (bật) hay không. Đơn giản nhưng quan trọng — gate kiểm tra trước khi thực thi logic phân quyền." },
                {
                    type: "codetabs", label: "isApplied",
                    desc: "Return true nếu category_key tồn tại và is_applied = 1.",
                    php: `// AccessControlResourceCategoryQueryService.php
public static function isApplied(string $resourceCategory): bool
{
    $model = ClassRegistry::init([
        'class' => 'PpAccessControlSettingResourceCategory',
        'alias' => 't'
    ]);
    $record = $model->find('first', [
        'fields' => ['t.id'],
        'conditions' => [
            't.category_key' => $resourceCategory,
            't.is_applied' => 1,
        ],
    ]);
    return !empty($record);
}`,
                    js: `const ResourceCategory = require(
  '../models/PpAccessControlSettingResourceCategory'
);

async function isApplied(resourceCategory) {
  const doc = await ResourceCategory.findOne({
    category_key: resourceCategory,
    is_applied: 1,
  }).lean();
  return doc !== null;
}

module.exports = { isApplied };`
                },
            ],
        },

        // ─────────────────────────────────────────────
        // 7. SettingPolicyQueryService
        // ─────────────────────────────────────────────
        {
            id: "ac-setting-policy",
            title: "SettingPolicy QueryService",
            tags: ["Access Control", "Policy"],
            content: [
                { type: "text", value: "Đếm số policy đang active và tìm policy dạng 'byRelationship'." },
                {
                    type: "codetabs", label: "getCountEnable / getRelationshipEnable",
                    desc: "Hai hàm static: đếm policy active + lấy IDs policy dạng relationship.",
                    php: `// AccessControlSettingPolicyQueryService.php
public static function getCountEnable(): int
{
    $model = ClassRegistry::init('PpAccessControlSettingPolicy');
    $record = $model->find('first', [
        'fields' => ['count(id) n'],
        'conditions' => ['status' => 1],
    ]);
    return (int)$record[0]['n'];
}

public static function getRelationshipEnable(): array
{
    $model = ClassRegistry::init('PpAccessControlSettingPolicy');
    $records = $model->find('all', [
        'fields' => ['id'],
        'conditions' => [
            'status' => 1,
            'applicable_type' => 'byRelationship'
        ],
    ]);
    return Hash::extract($records, '{n}.PpAccessControlSettingPolicy.id');
}`,
                    js: `const Policy = require('../models/PpAccessControlSettingPolicy');

async function getCountEnable() {
  return Policy.countDocuments({ status: 1 });
}

async function getRelationshipEnable() {
  const docs = await Policy.find(
    { status: 1, applicable_type: 'byRelationship' },
    { _id: 1 }
  ).lean();
  return docs.map(d => d._id);
}

module.exports = { getCountEnable, getRelationshipEnable };`
                },
            ],
        },

        // ─────────────────────────────────────────────
        // 8. PolicyApplyQueryService — saveActors
        // ─────────────────────────────────────────────
        {
            id: "ac-policy-apply",
            title: "PolicyApply QueryService",
            tags: ["Access Control", "Policy", "Write"],
            content: [
                { type: "text", value: "Các hàm write: lưu actors (người xem), refresh affiliation cache, lưu other targets. Đây là nơi bulk insert được dùng nhiều nhất." },
                {
                    type: "codetabs", label: "saveActors",
                    desc: "Bulk insert actors (người xem) cho 1 policy. Mỗi actor có 11 affiliation flags (00~10).",
                    php: `// PolicyApplyQueryService.php
public function saveActors(string $policyId, ApplicableEmployeeCollection $employees): void
{
    $model = ClassRegistry::init('PpAccessControlPolicyActor');
    $chunked = array_chunk($employees->getEntities(), 1000);

    foreach ($chunked as $list) {
        $params = []; $placeholders = [];
        foreach ($list as $entity) {
            $placeholders[] = '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            $params[] = $policyId;
            $params[] = $entity->getEmployeeId()->getValue();
            foreach (range(0, 10) as $i)
                $params[] = $entity->{"isApplicableAffiliation" . sprintf('%02d', $i)}();
        }
        $sql = "INSERT IGNORE INTO pp_access_control_policy_actors
            (policy_id, pp_employee_id,
             is_applicable_affiliation_00, ..._01, ..._10)
            VALUES " . implode(',', $placeholders);
        $model->query($sql, $params);
    }
}`,
                    js: `const PolicyActor = require('../models/PpAccessControlPolicyActor');

async function saveActors(policyId, employees) {
  // Chunk 1000 tại một thời điểm
  const CHUNK = 1000;
  for (let i = 0; i < employees.length; i += CHUNK) {
    const chunk = employees.slice(i, i + CHUNK);
    const docs = chunk.map(emp => {
      const doc = {
        policy_id: policyId,
        pp_employee_id: emp.employeeId,
      };
      for (let j = 0; j <= 10; j++) {
        const idx = String(j).padStart(2, '0');
        doc[\`is_applicable_affiliation_\${idx}\`] =
          emp[\`isApplicableAffiliation\${idx}\`];
      }
      return doc;
    });
    // insertMany với ordered:false = bỏ qua duplicate (như INSERT IGNORE)
    await PolicyActor.insertMany(docs, { ordered: false })
      .catch(err => {
        // Bỏ qua duplicate key errors
        if (err.code !== 11000) throw err;
      });
  }
}

module.exports = { saveActors };`
                },
                {
                    type: "codetabs", label: "saveActorOtherTargets",
                    desc: "Lưu kết quả 'employee A xem được employee B, C, D...' cho 1 target setting.",
                    php: `public function saveActorOtherTargets(
    string $empId, string $policyId,
    string $targetId, array $targetEmpIds
): void {
    Configure::write('AppInfo.sql.log', false); // Tắt log vì data lớn
    $model = ClassRegistry::init('PpAccessControlPolicyActorOtherTarget');
    $model->create();
    $model->save([
        'pp_employee_id' => $empId,
        'policy_id' => $policyId,
        'target_id' => $targetId,
        'content' => json_encode($targetEmpIds),
    ]);
    Configure::write('AppInfo.sql.log', true);
}`,
                    js: `const OtherTarget = require(
  '../models/PpAccessControlPolicyActorOtherTarget'
);

async function saveActorOtherTargets(
  employeeId, policyId, targetId, targetEmployeeIds
) {
  await OtherTarget.updateOne(
    { pp_employee_id: employeeId, policy_id: policyId, target_id: targetId },
    {
      $set: {
        content: targetEmployeeIds, // MongoDB lưu array trực tiếp
      },
    },
    { upsert: true } // Insert nếu chưa tồn tại
  );
}

module.exports = { saveActorOtherTargets };`
                },
            ],
        },

        // ─────────────────────────────────────────────
        // 9. EmployeeAffiliationQueryService — refresh
        // ─────────────────────────────────────────────
        {
            id: "ac-emp-affiliation",
            title: "EmployeeAffiliation QueryService",
            tags: ["Access Control", "Batch", "Cache"],
            content: [
                { type: "text", value: "Batch job: TRUNCATE + rebuild bảng pp_employee_affiliations. Lấy toàn bộ employee + phát lệnh (本務 + 兼務 0~10) + master rank → lưu dạng JSON columns." },
                {
                    type: "codetabs", label: "refresh (simplified)",
                    desc: "Logic chính: query tất cả employee + employee_changes + additional_employee_changes → build affiliation JSON → bulk insert.",
                    php: `// EmployeeAffiliationQueryService.php (simplified)
public function refresh(): void
{
    $now = Date::now('Y-m-d');
    $organizationStructures = (new OrganizationQueryService())
        ->getCurrentOrganizationStructures();
    $managers = $this->getManagers();

    $model = ClassRegistry::init('PpEmployee');
    $fields = ['PpEmployee.id', 'PpEmployee.employee_id',
               'ec.enroll_class', 'ec.employment_class_cdkey'];

    // JOIN employee_changes (本務)
    // JOIN main_employee_changes (主要発令)
    // JOIN additional_employee_changes x10 (兼務)
    $options = [
        'fields' => $fields,
        'joins' => [
            ['type'=>'inner','table'=>'employee_changes','alias'=>'ec',
             'conditions'=>['ec.employee_id = PpEmployee.employee_id',
                            'ec.start_date <=' => $now, 'ec.end_date >' => $now]],
            // ... main_ec, add_ec_1~10
        ],
    ];
    $records = $model->find('all', $options);

    // Build save data: base JSON + affiliation_00~10 JSON
    $saveDataList = [];
    foreach ($records as $record) {
        $saveData = ['pp_employee_id' => $record['PpEmployee']['id']];
        $saveData['base'] = json_encode([...baseData...]);
        foreach (range(0, 10) as $i) {
            $saveData["affiliation_$i"] = json_encode([...affiliationData...]);
        }
        $saveDataList[] = $saveData;
    }

    // TRUNCATE + bulk INSERT
    $this->truncate();
    $this->save($saveDataList); // chunk 1000, INSERT IGNORE
}`,
                    js: `// employeeAffiliationService.js (simplified)
const PpEmployee = require('../models/PpEmployee');
const EmployeeChange = require('../models/EmployeeChange');
const Affiliation = require('../models/PpEmployeeAffiliation');
const { getCurrentOrgStructures } = require('./organizationService');
const { getManagers } = require('./unitManagerService');

async function refresh() {
  const now = new Date();
  const orgStructures = await getCurrentOrgStructures();
  const managers = await getManagers();

  // Aggregate: employee + changes + additional changes
  const records = await PpEmployee.aggregate([
    {
      $lookup: {
        from: 'employee_changes', let: { eid: '$employee_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$employee_id', '$$eid'] },
            start_date: { $lte: now }, end_date: { $gt: now } } },
        ],
        as: 'ec',
      },
    },
    { $unwind: '$ec' },
    // ... similar $lookup for main_employee_changes, additional x10
  ]);

  // Build documents
  const docs = records.map(r => {
    const doc = {
      pp_employee_id: r._id,
      base: {
        enroll_class: r.ec.enroll_class,
        employment_class_cdkey: r.ec.employment_class_cdkey,
        as_manager_unit_ids: managers[r.employee_id] || [],
      },
    };
    // affiliation_00 ~ affiliation_10
    for (let i = 0; i <= 10; i++) {
      const idx = String(i).padStart(2, '0');
      doc[\`affiliation_\${idx}\`] = buildAffiliation(r, i, orgStructures);
    }
    return doc;
  });

  // TRUNCATE + bulk insert
  await Affiliation.deleteMany({});
  // Chunk insert
  const CHUNK = 1000;
  for (let i = 0; i < docs.length; i += CHUNK) {
    await Affiliation.insertMany(docs.slice(i, i + CHUNK));
  }
}

function buildAffiliation(record, index, orgStructures) {
  // Extract unit_id, job codes, compute ranks...
  // Return object (MongoDB stores natively, no JSON encode needed)
  return { /* ... */ };
}

module.exports = { refresh };`
                },
            ],
        },

        // ─────────────────────────────────────────────
        // 10. EmployeeManagerQueryService
        // ─────────────────────────────────────────────
        {
            id: "ac-emp-manager",
            title: "EmployeeManager QueryService",
            tags: ["Access Control", "Batch", "Cache"],
            content: [
                { type: "text", value: "Batch job đơn giản hơn: rebuild pp_employee_managers — lưu thông tin department (unit_id + left/right cho nested set) của mỗi manager." },
                {
                    type: "codetabs", label: "refresh",
                    desc: "TRUNCATE → query managers + org structure → bulk insert.",
                    php: `// EmployeeManagerQueryService.php
public function refresh(): void
{
    $managers = $this->getManagers(); // JOIN pp_employees + unit_managers
    $this->truncate();               // TRUNCATE pp_employee_managers
    $this->save($managers);          // bulk INSERT (chunk 1000)
}

private function getManagers(): array
{
    $model = ClassRegistry::init('PpEmployee');
    $records = $model->find('all', [
        'fields' => ['PpEmployee.id', 'um.unit_id'],
        'joins' => [[
            'type'=>'inner','table'=>'unit_managers','alias'=>'um',
            'conditions'=>['um.manager_id = PpEmployee.employee_id'],
        ]],
        'conditions' => ['um.start_date <= now()', 'um.end_date > now()'],
    ]);
    $orgStructures = (new OrganizationQueryService())
        ->getCurrentOrganizationStructures();
    return array_map(function ($r) use ($orgStructures) {
        $s = $orgStructures[$r['um']['unit_id']];
        return [
            'pp_employee_id' => $r['PpEmployee']['id'],
            'department' => json_encode([
                'unit_id' => $r['um']['unit_id'],
                'left' => $s['left'], 'right' => $s['right'],
            ]),
        ];
    }, $records);
}`,
                    js: `const PpEmployee = require('../models/PpEmployee');
const UnitManager = require('../models/UnitManager');
const EmpManager = require('../models/PpEmployeeManager');
const { getCurrentOrgStructures } = require('./organizationService');

async function refresh() {
  const now = new Date();
  const orgStructures = await getCurrentOrgStructures();

  const records = await PpEmployee.aggregate([
    {
      $lookup: {
        from: 'unit_managers',
        let: { eid: '$employee_id' },
        pipeline: [
          { $match: {
            $expr: { $eq: ['$manager_id', '$$eid'] },
            start_date: { $lte: now },
            end_date: { $gt: now },
          }},
        ],
        as: 'um',
      },
    },
    { $unwind: '$um' },
  ]);

  const docs = records.map(r => {
    const structure = orgStructures[r.um.unit_id] || {};
    return {
      pp_employee_id: r._id,
      department: {
        unit_id: r.um.unit_id,
        left: structure.left,
        right: structure.right,
      },
    };
  });

  await EmpManager.deleteMany({});
  const CHUNK = 1000;
  for (let i = 0; i < docs.length; i += CHUNK) {
    await EmpManager.insertMany(docs.slice(i, i + CHUNK));
  }
}

module.exports = { refresh };`
                },
            ],
        },
    ],
};
