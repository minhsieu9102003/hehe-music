import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";

// ═══════════════════════════════════════════════════
// DOCS DATA — dễ cập nhật: thêm section/topic vào đây
// ═══════════════════════════════════════════════════
const CATEGORIES = [
    {
        id: "architecture",
        title: "Kiến trúc",
        icon: "arch",
        topics: [
            {
                id: "layered",
                title: "Kiến trúc phân tầng",
                tags: ["Thiết kế", "PHP"],
                content: [
                    { type: "text", value: "Backend của CYDAS People áp dụng **Kiến trúc phân tầng (Layered Architecture)**. Mỗi tầng có trách nhiệm rõ ràng, giúp giảm thiểu phạm vi ảnh hưởng khi có thay đổi." },
                    { type: "diagram", id: "layered-arch" },
                    { type: "heading", value: "Trách nhiệm từng tầng" },
                    {
                        type: "cards", items: [
                            { title: "Controller", desc: "Tiếp nhận HTTP Request, trả Response. Không chứa business logic — chỉ gọi Application Service.", color: "#E8927C" },
                            { title: "Application Service", desc: "Vai trò điều phối use case. Kết hợp các domain object để thực thi luồng xử lý. Quản lý transaction cũng ở đây.", color: "#7EC8A0" },
                            { title: "Domain", desc: "Nơi chứa business rule và logic chính. Entity, Value Object, Domain Service. Không phụ thuộc framework.", color: "#6BB8D6" },
                            { title: "Repository", desc: "Trừu tượng hóa việc lưu trữ và truy xuất dữ liệu. Thực thi SQL query, liên kết CakePHP Model được đóng gói ở đây.", color: "#C490D1" },
                        ]
                    },
                    { type: "heading", value: "Quy tắc đường dẫn file" },
                    {
                        type: "code", lang: "text", value: `app/Lib/people/
├── Core/
│   ├── Application/        ← Application Service
│   │   └── HrReport/
│   │       └── SomeUseCase.php
│   ├── Domain/             ← Domain (Entity, VO, Service)
│   │   └── HrReport/
│   │       └── SomeEntity.php
│   └── Infrastructure/     ← Triển khai Repository
│       ├── Cake2/          ← Thông qua CakePHP Model
│       └── Cake2Query/     ← SQL trực tiếp (QueryService)
├── Entity/                 ← Legacy Entity (đang dần chuyển sang Core/Domain)
└── Service/                ← Legacy Service` },
                    { type: "tip", value: "Khi điều tra phạm vi ảnh hưởng, nắm rõ cấu trúc tầng giúp truy vết hiệu quả 'thay đổi lan tới đâu'. Thay đổi Repository ảnh hưởng Domain, thay đổi Domain có thể lan tới Controller thông qua Application Service." },
                ],
            },
            {
                id: "data-flow",
                title: "Tổng quan luồng dữ liệu",
                tags: ["Thiết kế", "Vue", "PHP"],
                content: [
                    { type: "text", value: "Hiểu rõ luồng request-response từ Frontend (Vue 2) đến Backend (CakePHP) và Database (MySQL) là điều thiết yếu cho việc debug và nắm bắt phạm vi ảnh hưởng." },
                    { type: "diagram", id: "data-flow" },
                    { type: "heading", value: "Hành trình của một Request" },
                    {
                        type: "steps", items: [
                            { label: "Vue Component", desc: "Thao tác người dùng → dispatch Vuex Action hoặc gọi API trực tiếp" },
                            { label: "Axios / API", desc: "Gửi HTTP request (POST/GET). URL được resolve bởi CakePHP Router" },
                            { label: "CakePHP Router", desc: "Mapping URL → Controller::action" },
                            { label: "Controller", desc: "Phân tích request → gọi Application Service" },
                            { label: "App Service", desc: "Thực thi Domain logic → thao tác dữ liệu qua Repository" },
                            { label: "Repository", desc: "Thực thi SQL / thao tác DB thông qua CakePHP Model" },
                            { label: "MySQL", desc: "Thực thi query → trả kết quả" },
                        ]
                    },
                ],
            },
        ],
    },
    {
        id: "vue2",
        title: "Vue 2",
        icon: "vue",
        topics: [
            {
                id: "vue-options",
                title: "Cơ bản Options API",
                tags: ["Vue 2", "Cơ bản"],
                content: [
                    { type: "text", value: "Vue 2 sử dụng **Options API**. Component được định nghĩa dưới dạng object, bao gồm các option như `data`, `computed`, `methods`, `watch`." },
                    { type: "warning", value: "Khác với Composition API của Vue 3 (setup, ref, reactive). CYDAS People dùng Vue 2 nên thống nhất Options API." },
                    {
                        type: "code", lang: "vue", value: `<template>
  <div class="employee-card">
    <h3>{{ fullName }}</h3>
    <p>{{ department }}</p>
    <button @click="toggleDetail">
      {{ isOpen ? '閉じる' : '詳細' }}
    </button>
    <div v-if="isOpen">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmployeeCard',
  // props: Dữ liệu nhận từ component cha (nên định nghĩa type)
  props: {
    employee: {
      type: Object,
      required: true,
    },
    department: {
      type: String,
      default: '',
    },
  },
  // data: State reactive riêng của component
  // ※ Bắt buộc định nghĩa dạng function (để mỗi instance độc lập)
  data() {
    return {
      isOpen: false,
    };
  },
  // computed: Tự động tính toán từ data phụ thuộc (có cache)
  computed: {
    fullName() {
      return this.employee.lastName + ' '
        + this.employee.firstName;
    },
  },
  // methods: Event handler và hàm xử lý
  methods: {
    toggleDetail() {
      this.isOpen = !this.isOpen;
    },
  },
  // watch: Theo dõi thay đổi data và thực thi side effect
  watch: {
    employee: {
      handler(newVal) {
        console.log('Employee changed:', newVal);
      },
      deep: true, // Theo dõi cả property lồng nhau
    },
  },
};
</script>` },
                    { type: "heading", value: "Lưu ý quan trọng" },
                    {
                        type: "cards", items: [
                            { title: "data phải là hàm", desc: "Bắt buộc dùng dạng data() { return {...} }. Nếu viết trực tiếp object, tất cả instance sẽ chia sẻ cùng data.", color: "#E8927C" },
                            { title: "Giới hạn Reactivity", desc: "Trong Vue 2, thêm property mới vào object không được tự động phát hiện. Phải dùng Vue.set() hoặc this.$set().", color: "#6BB8D6" },
                            { title: "Lưu ý với mảng", desc: "Gán trực tiếp qua index (arr[0] = x) không được phát hiện. Dùng splice() hoặc Vue.set().", color: "#C490D1" },
                        ]
                    },
                    {
                        type: "code", lang: "js", value: `// ❌ Vue 2 không phát hiện được
this.obj.newProp = 'value';
this.arr[0] = 'new';

// ✅ Cách đúng
this.$set(this.obj, 'newProp', 'value');
this.$set(this.arr, 0, 'new');

// ✅ Thao tác mảng
this.arr.push('item');     // OK
this.arr.splice(0, 1);     // OK` },
                ],
            },
            {
                id: "vue-lifecycle",
                title: "Lifecycle Hooks",
                tags: ["Vue 2", "Cơ bản"],
                content: [
                    { type: "text", value: "Component Vue 2 đi qua một chuỗi lifecycle hook từ khởi tạo đến hủy. Hiểu đúng **khi nào có thể truy cập DOM** và **thời điểm gọi API** là rất quan trọng." },
                    { type: "diagram", id: "vue-lifecycle" },
                    {
                        type: "code", lang: "js", value: `export default {
  // Ngay sau khi tạo instance. Có thể dùng data, computed.
  // Chưa thể truy cập DOM.
  created() {
    this.fetchInitialData(); // Gọi APIに最適
  },

  // Ngay sau khi DOM được render.
  // Có thể dùng this.$el, this.$refs.
  mounted() {
    this.$refs.input.focus(); // Thao tác DOMに最適
    window.addEventListener('resize', this.onResize);
  },

  // Được gọi sau khi data thay đổi → DOM cập nhật.
  updated() {
    // Xử lý sau khi DOM cập nhật (chú ý: tránh vòng lặp vô hạn)
  },

  // Trước khi component bị hủy. Dùng để cleanup.
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    clearInterval(this.timer);
  },
};` },
                    { type: "tip", value: "Quy tắc: gọi API ở created(), thao tác DOM ở mounted(). Luôn giải phóng event listener và timer ở beforeDestroy() để tránh memory leak." },
                ],
            },
            {
                id: "vuex",
                title: "Vuex Store",
                tags: ["Vue 2", "Quản lý state"],
                content: [
                    { type: "text", value: "Vuex là thư viện quản lý state chính thức của Vue 2. Quản lý tập trung dữ liệu dùng chung giữa các component (thông tin user đăng nhập, thông báo, kết quả tìm kiếm...)." },
                    { type: "diagram", id: "vuex-flow" },
                    {
                        type: "code", lang: "js", value: `// store/modules/employee.js
export default {
  namespaced: true, // Bật namespace

  state: {
    list: [],
    loading: false,
    selectedId: null,
  },

  // getters: Computed property từ state
  getters: {
    selectedEmployee: (state) =>
      state.list.find(e => e.id === state.selectedId),
    activeCount: (state) =>
      state.list.filter(e => e.isActive).length,
  },

  // mutations: Cách duy nhất để thay đổi trực tiếp state (chỉ đồng bộ)
  mutations: {
    SET_LIST(state, employees) {
      state.list = employees;
    },
    SET_LOADING(state, flag) {
      state.loading = flag;
    },
  },

  // actions: Xử lý bất đồng bộ → commit mutation
  actions: {
    async fetchEmployees({ commit }) {
      commit('SET_LOADING', true);
      try {
        const res = await axios.get('/api/employees');
        commit('SET_LIST', res.data);
      } finally {
        commit('SET_LOADING', false);
      }
    },
  },
};` },
                    { type: "heading", value: "Sử dụng trong Component" },
                    {
                        type: "code", lang: "js", value: `// Trong component
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  computed: {
    // Map trực tiếp state
    ...mapState('employee', ['list', 'loading']),
    // Map getters
    ...mapGetters('employee', ['selectedEmployee']),
  },
  methods: {
    // Map actions
    ...mapActions('employee', ['fetchEmployees']),
  },
  created() {
    this.fetchEmployees();
  },
};` },
                ],
            },
        ],
    },
    {
        id: "cakephp",
        title: "CakePHP",
        icon: "php",
        topics: [
            {
                id: "cake-mvc",
                title: "MVC Pattern & Conventions",
                tags: ["CakePHP 2.x", "Cơ bản"],
                content: [
                    { type: "text", value: "CakePHP 2.x dựa trên triết lý **Convention over Configuration**. Chỉ cần tuân theo quy tắc đặt tên, framework sẽ tự động liên kết file và kết nối DB." },
                    { type: "heading", value: "Quy tắc đặt tên" },
                    {
                        type: "table", headers: ["Loại", "Tên class", "Tên file", "Tên bảng"], rows: [
                            ["Model", "Employee", "Employee.php", "employees"],
                            ["Controller", "EmployeesController", "EmployeesController.php", "—"],
                            ["View", "—", "view.ctp", "—"],
                            ["Model (複合)", "EmployeeStatus", "EmployeeStatus.php", "employee_statuses"],
                        ]
                    },
                    { type: "tip", value: "Tên Model số ít (Employee), tên Controller và tên bảng số nhiều (Employees/employees). CakePHP tự động chuyển đổi số ít ⇔ số nhiều." },
                    {
                        type: "code", lang: "php", value: `<?php
// app/Controller/EmployeesController.php
class EmployeesController extends AppController {

    // Employee Model tự động được load
    // $this->Employee để truy cập可能

    public function index() {
        // Lấy dữ liệu thông qua Model
        $employees = $this->Employee->find('all', [
            'conditions' => ['Employee.is_active' => true],
            'order' => ['Employee.created' => 'DESC'],
            'limit' => 50,
        ]);
        // Truyền sang View
        $this->set('employees', $employees);
    }

    // /employees/view/123 để truy cập
    public function view($id = null) {
        $employee = $this->Employee->findById($id);
        if (!$employee) {
            throw new NotFoundException();
        }
        $this->set('employee', $employee);
    }
}` },
                ],
            },
            {
                id: "cake-model",
                title: "Model & Associations",
                tags: ["CakePHP 2.x", "DB"],
                content: [
                    { type: "text", value: "Model trong CakePHP 2.x tương ứng 1-1 với bảng database, và dùng association (liên kết) để biểu diễn quan hệ giữa các bảng." },
                    { type: "heading", value: "アソシエーションLoại" },
                    {
                        type: "cards", items: [
                            { title: "hasMany", desc: "1-nhiều. Ví dụ: Department hasMany Employee (1 phòng ban có nhiều nhân viên)", color: "#7EC8A0" },
                            { title: "belongsTo", desc: "Nhiều-1. Ví dụ: Employee belongsTo Department (nhân viên thuộc 1 phòng ban)", color: "#6BB8D6" },
                            { title: "hasOne", desc: "1-1. Ví dụ: Employee hasOne Profile", color: "#C490D1" },
                            { title: "HABTM", desc: "Nhiều-nhiều. Ví dụ: Employee HABTM Skill (dùng bảng trung gian)", color: "#E8927C" },
                        ]
                    },
                    {
                        type: "code", lang: "php", value: `<?php
// app/Model/Employee.php
class Employee extends AppModel {

    public $belongsTo = [
        'Department' => [
            'className' => 'Department',
            'foreignKey' => 'department_id',
        ],
    ];

    public $hasOne = [
        'Profile' => [
            'className' => 'EmployeeProfile',
            'foreignKey' => 'employee_id',
            'dependent' => true, // Khi xóa Employee thì Profile cũng bị xóa
        ],
    ];

    // Validation rules
    public $validate = [
        'name' => [
            'notBlank' => [
                'rule' => 'notBlank',
                'message' => 'Tên là bắt buộc.',
            ],
        ],
        'email' => [
            'email' => [
                'rule' => 'email',
                'message' => 'Vui lòng nhập email hợp lệ.',
            ],
            'unique' => [
                'rule' => 'isUnique',
                'message' => 'Email này đã được sử dụng.',
            ],
        ],
    ];
}` },
                ],
            },
        ],
    },
    {
        id: "mysql",
        title: "MySQL",
        icon: "db",
        topics: [
            {
                id: "mysql-joins",
                title: "Các loại JOIN và cách sử dụng",
                tags: ["MySQL", "SQL"],
                content: [
                    { type: "text", value: "Kết hợp bảng (JOIN) là thao tác cơ bản của SQL. Chọn đúng loại JOIN ảnh hưởng đến performance và độ chính xác kết quả." },
                    { type: "diagram", id: "sql-joins" },
                    {
                        type: "code", lang: "sql", value: `-- INNER JOIN: Chỉ record tồn tại ở cả 2 bảng
SELECT e.name, d.name AS dept_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.id;

-- LEFT JOIN: Bảng trái lấy hết, bảng phải chỉ lấy khớp
-- Bao gồm cả nhân viên chưa thuộc phòng ban
SELECT e.name, d.name AS dept_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id;

-- サブクエリ: Kết hợp với kết quả tổng hợp
SELECT d.name, sub.emp_count
FROM departments d
LEFT JOIN (
    SELECT department_id, COUNT(*) AS emp_count
    FROM employees
    WHERE is_active = 1
    GROUP BY department_id
) sub ON d.id = sub.department_id;` },
                    { type: "tip", value: "CYDAS People dùng nhiều LEFT JOIN vì có nhiều trường hợp cần 'trả về dòng ngay cả khi không có dữ liệu' (ví dụ: hiển thị cả người chưa nộp đánh giá trong danh sách)." },
                ],
            },
            {
                id: "mysql-index",
                title: "Index & Performance",
                tags: ["MySQL", "Tối ưu hóa"],
                content: [
                    { type: "text", value: "Index là yếu tố thiết yếu để tăng tốc query. Tuy nhiên, thêm bừa bãi sẽ làm chậm INSERT/UPDATE, nên cần thiết kế hợp lý." },
                    { type: "heading", value: "Trường hợp Index có hiệu quả" },
                    {
                        type: "code", lang: "sql", value: `-- Cột điều kiện trong WHERE
SELECT * FROM employees WHERE department_id = 5;
-- → department_id có index thì sẽ nhanh

-- Thứ tự composite index rất quan trọng
ALTER TABLE employees
ADD INDEX idx_dept_active (department_id, is_active);

-- ✅ Hiệu quả: sử dụng từ trái sang
WHERE department_id = 5 AND is_active = 1
WHERE department_id = 5

-- ❌ Không hiệu quả: thiếu cột đầu tiên
WHERE is_active = 1` },
                    { type: "warning", value: "Hãy tạo thói quen dùng EXPLAIN để kiểm tra kế hoạch thực thi. Kiểm tra type không phải ALL (full scan) và key không phải NULL." },
                    {
                        type: "code", lang: "sql", value: `EXPLAIN SELECT * FROM employees
WHERE department_id = 5 AND is_active = 1;

-- Điểm cần kiểm tra:
-- type:  ref > range > index > ALL (bên trái tốt hơn)
-- key:   Tên index được sử dụng
-- rows:  Số dòng scan (càng ít càng tốt)` },
                ],
            },
        ],
    },
];

// ═══════════════════════════════════════════════════
// Diagram components (SVG)
// ═══════════════════════════════════════════════════
function DiagramLayeredArch() {
    const layers = [
        { label: "Controller", sub: "HTTP Request / Response", color: "#E8927C", y: 0 },
        { label: "Application Service", sub: "Điều phối Use Case", color: "#7EC8A0", y: 64 },
        { label: "Domain", sub: "Business Logic", color: "#6BB8D6", y: 128 },
        { label: "Repository", sub: "Lưu trữ dữ liệu", color: "#C490D1", y: 192 },
    ];
    return (
        <svg viewBox="0 0 480 260" className="dc-diagram">
            {layers.map((l, i) => (
                <g key={i}>
                    <rect x="60" y={l.y + 8} width="360" height="48" rx="8" fill={l.color} opacity="0.15" stroke={l.color} strokeWidth="1.5" className="dc-diag-rect" style={{ animationDelay: `${i * 0.1}s` }} />
                    <text x="240" y={l.y + 28} textAnchor="middle" fill="#333" fontSize="13" fontWeight="600">{l.label}</text>
                    <text x="240" y={l.y + 44} textAnchor="middle" fill="#888" fontSize="10">{l.sub}</text>
                    {i < layers.length - 1 && <path d={`M240 ${l.y + 56} L240 ${l.y + 72}`} stroke="#ccc" strokeWidth="1.5" markerEnd="url(#arrowD)" />}
                </g>
            ))}
            <defs><marker id="arrowD" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#ccc" /></marker></defs>
        </svg>
    );
}

function DiagramDataFlow() {
    const nodes = [
        { label: "Vue Component", x: 40, color: "#7EC8A0" },
        { label: "Axios", x: 120, color: "#6BB8D6" },
        { label: "Router", x: 200, color: "#E8927C" },
        { label: "Controller", x: 280, color: "#E8927C" },
        { label: "Service", x: 360, color: "#7EC8A0" },
        { label: "Repository", x: 440, color: "#C490D1" },
        { label: "MySQL", x: 520, color: "#D4A85C" },
    ];
    return (
        <svg viewBox="0 0 600 70" className="dc-diagram dc-diagram--wide">
            {nodes.map((n, i) => (
                <g key={i}>
                    <rect x={n.x - 32} y="16" width="64" height="32" rx="6" fill={n.color} opacity="0.2" stroke={n.color} strokeWidth="1" className="dc-diag-rect" style={{ animationDelay: `${i * 0.08}s` }} />
                    <text x={n.x} y="36" textAnchor="middle" fill="#333" fontSize="9" fontWeight="500">{n.label}</text>
                    {i < nodes.length - 1 && <line x1={n.x + 32} y1="32" x2={nodes[i + 1].x - 32} y2="32" stroke="#ddd" strokeWidth="1" markerEnd="url(#arrowF)" />}
                </g>
            ))}
            <defs><marker id="arrowF" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4" fill="#ddd" /></marker></defs>
        </svg>
    );
}

function DiagramVueLifecycle() {
    const steps = ["beforeCreate", "created", "beforeMount", "mounted", "beforeUpdate", "updated", "beforeDestroy", "destroyed"];
    const highlights = { created: "Gọi API", mounted: "Thao tác DOM", beforeDestroy: "Cleanup" };
    return (
        <svg viewBox="0 0 480 200" className="dc-diagram">
            {steps.map((s, i) => {
                const x = 30 + i * 56;
                const hl = highlights[s];
                return (
                    <g key={i}>
                        <rect x={x} y={hl ? 30 : 40} width="50" height={hl ? 50 : 32} rx="6" fill={hl ? "#5d8a72" : "#f0f2f5"} opacity={hl ? 0.15 : 1} stroke={hl ? "#5d8a72" : "#ddd"} strokeWidth="1" className="dc-diag-rect" style={{ animationDelay: `${i * 0.06}s` }} />
                        <text x={x + 25} y="60" textAnchor="middle" fill={hl ? "#5d8a72" : "#666"} fontSize="7" fontWeight={hl ? "600" : "400"} transform={`rotate(-35 ${x + 25} 60)`}>{s}</text>
                        {hl && <text x={x + 25} y="90" textAnchor="middle" fill="#5d8a72" fontSize="7">{hl}</text>}
                        {i < steps.length - 1 && <line x1={x + 50} y1="56" x2={x + 56} y2="56" stroke="#ddd" strokeWidth="1" />}
                    </g>
                );
            })}
        </svg>
    );
}

function DiagramVuexFlow() {
    return (
        <svg viewBox="0 0 380 180" className="dc-diagram">
            {[
                { label: "Component", x: 190, y: 20, w: 100, color: "#7EC8A0" },
                { label: "Actions", x: 60, y: 80, w: 80, color: "#6BB8D6" },
                { label: "Mutations", x: 190, y: 140, w: 100, color: "#E8927C" },
                { label: "State", x: 300, y: 80, w: 70, color: "#C490D1" },
            ].map((n, i) => (
                <g key={i}>
                    <rect x={n.x - n.w / 2} y={n.y} width={n.w} height="32" rx="6" fill={n.color} opacity="0.15" stroke={n.color} strokeWidth="1" className="dc-diag-rect" style={{ animationDelay: `${i * 0.1}s` }} />
                    <text x={n.x} y={n.y + 20} textAnchor="middle" fill="#333" fontSize="10" fontWeight="500">{n.label}</text>
                </g>
            ))}
            <defs><marker id="arrowV" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4" fill="#bbb" /></marker></defs>
            <path d="M160 36 L100 80" stroke="#bbb" strokeWidth="1" fill="none" markerEnd="url(#arrowV)" />
            <text x="110" y="55" fill="#999" fontSize="7">dispatch</text>
            <path d="M100 112 L165 140" stroke="#bbb" strokeWidth="1" fill="none" markerEnd="url(#arrowV)" />
            <text x="110" y="130" fill="#999" fontSize="7">commit</text>
            <path d="M240 160 L300 112" stroke="#bbb" strokeWidth="1" fill="none" markerEnd="url(#arrowV)" />
            <text x="280" y="140" fill="#999" fontSize="7">mutate</text>
            <path d="M320 80 L230 52" stroke="#bbb" strokeWidth="1" fill="none" markerEnd="url(#arrowV)" />
            <text x="290" y="62" fill="#999" fontSize="7">render</text>
        </svg>
    );
}

function DiagramSqlJoins() {
    return (
        <svg viewBox="0 0 480 100" className="dc-diagram">
            {[
                { label: "INNER JOIN", desc: "Chỉ phần giao", lOp: 0.1, rOp: 0.1, cOp: 0.3, x: 0 },
                { label: "LEFT JOIN", desc: "Trái hết + phần giao", lOp: 0.3, rOp: 0.1, cOp: 0.3, x: 170 },
                { label: "FULL JOIN", desc: "Cả hai bảng", lOp: 0.3, rOp: 0.3, cOp: 0.3, x: 340 },
            ].map((j, i) => (
                <g key={i}>
                    <circle cx={j.x + 45} cy="40" r="28" fill="#6BB8D6" opacity={j.lOp} stroke="#6BB8D6" strokeWidth="1" />
                    <circle cx={j.x + 75} cy="40" r="28" fill="#E8927C" opacity={j.rOp} stroke="#E8927C" strokeWidth="1" />
                    <text x={j.x + 60} y="80" textAnchor="middle" fill="#333" fontSize="10" fontWeight="600">{j.label}</text>
                    <text x={j.x + 60} y="93" textAnchor="middle" fill="#999" fontSize="8">{j.desc}</text>
                </g>
            ))}
        </svg>
    );
}

const DIAGRAMS = {
    "layered-arch": DiagramLayeredArch,
    "data-flow": DiagramDataFlow,
    "vue-lifecycle": DiagramVueLifecycle,
    "vuex-flow": DiagramVuexFlow,
    "sql-joins": DiagramSqlJoins,
};

// ═══════════════════════════════════════════════════
// Content Renderers
// ═══════════════════════════════════════════════════
function renderBlock(block, i) {
    switch (block.type) {
        case "text":
            return <p key={i} className="dc-text" dangerouslySetInnerHTML={{ __html: block.value.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") }} />;
        case "heading":
            return <h3 key={i} className="dc-h3">{block.value}</h3>;
        case "code":
            return (
                <div key={i} className="dc-code-wrap">
                    <div className="dc-code-lang">{block.lang}</div>
                    <pre className="dc-code"><code>{block.value}</code></pre>
                </div>
            );
        case "tip":
            return <div key={i} className="dc-callout dc-callout--tip"><span className="dc-callout__icon">💡</span><div>{block.value}</div></div>;
        case "warning":
            return <div key={i} className="dc-callout dc-callout--warn"><span className="dc-callout__icon">⚠️</span><div>{block.value}</div></div>;
        case "diagram":
            const Diag = DIAGRAMS[block.id];
            return Diag ? <div key={i} className="dc-diag-wrap"><Diag /></div> : null;
        case "cards":
            return (
                <div key={i} className="dc-cards">
                    {block.items.map((c, j) => (
                        <div key={j} className="dc-minicard" style={{ borderLeftColor: c.color }}>
                            <div className="dc-minicard__title">{c.title}</div>
                            <div className="dc-minicard__desc">{c.desc}</div>
                        </div>
                    ))}
                </div>
            );
        case "steps":
            return (
                <div key={i} className="dc-steps">
                    {block.items.map((s, j) => (
                        <div key={j} className="dc-step">
                            <div className="dc-step__num">{j + 1}</div>
                            <div className="dc-step__body">
                                <div className="dc-step__label">{s.label}</div>
                                <div className="dc-step__desc">{s.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        case "table":
            return (
                <div key={i} className="dc-table-wrap">
                    <table className="dc-table">
                        <thead><tr>{block.headers.map((h, j) => <th key={j}>{h}</th>)}</tr></thead>
                        <tbody>{block.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}><code>{c}</code></td>)}</tr>)}</tbody>
                    </table>
                </div>
            );
        default: return null;
    }
}

// Category icons
function CatIcon({ type, s = 20, c = "#7da08a" }) {
    switch (type) {
        case "arch": return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
        case "vue": return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
        case "php": return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
        case "db": return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>;
        default: return null;
    }
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════
export default function DocsPage() {
    const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
    const [activeTopic, setActiveTopic] = useState(CATEGORIES[0].topics[0].id);
    const [search, setSearch] = useState("");
    const contentRef = useRef(null);

    const cat = CATEGORIES.find(c => c.id === activeCat);
    const topic = cat?.topics.find(t => t.id === activeTopic);

    // Search across all
    const allTopics = CATEGORIES.flatMap(c => c.topics.map(t => ({ ...t, catId: c.id, catTitle: c.title })));
    const searchResults = search.length >= 2
        ? allTopics.filter(t =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
            t.content.some(b => (b.value || "").toLowerCase().includes(search.toLowerCase()))
        )
        : [];

    const selectTopic = (catId, topicId) => {
        setActiveCat(catId);
        setActiveTopic(topicId);
        setSearch("");
        contentRef.current?.scrollTo(0, 0);
    };

    return (
        <>
            <style>{CSS}</style>
            <div className="hp-lay">
                <Sidebar activeId="" />
                <div className="hp-main">
                    <div className="dc-layout">
                        {/* Docs sidebar */}
                        <nav className="dc-nav">
                            <div className="dc-nav__head">
                                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#7da08a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                                <span>Tài liệu</span>
                            </div>
                            <div className="dc-nav__search">
                                <input type="text" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            {search.length >= 2 ? (
                                <div className="dc-nav__results">
                                    {searchResults.length === 0 ? <div className="dc-nav__empty">Không tìm thấy</div> : searchResults.map(t => (
                                        <div key={t.id} className="dc-nav__result" onClick={() => selectTopic(t.catId, t.id)}>
                                            <span className="dc-nav__result-title">{t.title}</span>
                                            <span className="dc-nav__result-cat">{t.catTitle}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="dc-nav__cats">
                                    {CATEGORIES.map(c => (
                                        <div key={c.id} className="dc-nav__cat">
                                            <div className={`dc-nav__cat-head ${activeCat === c.id ? "is-active" : ""}`} onClick={() => setActiveCat(c.id)}>
                                                <CatIcon type={c.icon} s={16} />
                                                <span>{c.title}</span>
                                            </div>
                                            {activeCat === c.id && (
                                                <div className="dc-nav__topics">
                                                    {c.topics.map(t => (
                                                        <div key={t.id} className={`dc-nav__topic ${activeTopic === t.id ? "is-active" : ""}`} onClick={() => selectTopic(c.id, t.id)}>
                                                            {t.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </nav>

                        {/* Content */}
                        <div className="dc-content" ref={contentRef}>
                            {topic ? (
                                <article className="dc-article" key={topic.id}>
                                    <div className="dc-article__head">
                                        <h1>{topic.title}</h1>
                                        <div className="dc-tags">
                                            {topic.tags.map(t => <span key={t} className="dc-tag">{t}</span>)}
                                        </div>
                                    </div>
                                    <div className="dc-article__body">
                                        {topic.content.map((block, i) => renderBlock(block, i))}
                                    </div>
                                </article>
                            ) : (
                                <div className="dc-empty">Vui lòng chọn một chủ đề</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ═══════════════════════════════════════════════════
const CSS = `
.hp-lay{display:flex;min-height:calc(100vh - 64px)}
.hp-main{flex:1;background:#fff;min-width:0;overflow-y:auto}
.dc-layout{display:flex;height:calc(100vh - 64px);font-family:"Inter","Noto Sans","Segoe UI","Hiragino Kaku Gothic ProN",sans-serif}

/* Nav */
.dc-nav{width:260px;min-width:220px;border-right:1px solid #e8e8e8;display:flex;flex-direction:column;background:#fafbfc;flex-shrink:0}
@media(max-width:800px){.dc-nav{width:200px;min-width:180px}}
@media(max-width:600px){.dc-layout{flex-direction:column}.dc-nav{width:100%;height:auto;max-height:35vh;border-right:none;border-bottom:1px solid #e8e8e8}}
.dc-nav__head{display:flex;align-items:center;gap:8px;padding:16px 16px 8px;font-size:14px;font-weight:700;color:#333}
.dc-nav__search{padding:4px 12px 12px}
.dc-nav__search input{width:100%;border:1px solid #e0e0e0;border-radius:6px;padding:6px 10px;font-size:12px;outline:none;font-family:inherit;color:#333}
.dc-nav__search input:focus{border-color:#5d8a72}
.dc-nav__search input::placeholder{color:#bbb}
.dc-nav__cats{flex:1;overflow-y:auto;padding:0 8px 8px}
.dc-nav__cat-head{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;font-size:13px;font-weight:600;color:#555;cursor:pointer;transition:background .15s}
.dc-nav__cat-head:hover{background:#f0f2f5}
.dc-nav__cat-head.is-active{color:#5d8a72;background:#eaf4ee}
.dc-nav__topics{padding:2px 0 6px 20px}
.dc-nav__topic{padding:6px 10px;border-radius:6px;font-size:12px;color:#666;cursor:pointer;transition:background .15s,color .15s}
.dc-nav__topic:hover{background:#f0f2f5}
.dc-nav__topic.is-active{color:#5d8a72;background:#eaf4ee;font-weight:600}
.dc-nav__results{flex:1;overflow-y:auto;padding:0 8px}
.dc-nav__result{padding:8px 10px;border-radius:6px;cursor:pointer;transition:background .15s}
.dc-nav__result:hover{background:#f0f2f5}
.dc-nav__result-title{display:block;font-size:12px;font-weight:600;color:#333}
.dc-nav__result-cat{font-size:10px;color:#999}
.dc-nav__empty{padding:16px;text-align:center;color:#ccc;font-size:12px}

/* Content */
.dc-content{flex:1;overflow-y:auto;padding:32px 48px 80px}
@media(max-width:1023px){.dc-content{padding:24px 24px 64px}}
@media(max-width:600px){.dc-content{padding:16px 16px 48px}}
.dc-empty{display:flex;align-items:center;justify-content:center;height:100%;color:#ccc;font-size:14px}
.dc-article{animation:dcFade .35s ease}
@keyframes dcFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.dc-article__head{margin-bottom:24px}
.dc-article__head h1{font-size:22px;font-weight:700;color:#333;margin:0 0 8px}
.dc-tags{display:flex;gap:6px;flex-wrap:wrap}
.dc-tag{font-size:11px;padding:2px 8px;border-radius:4px;background:#eaf4ee;color:#5d8a72;font-weight:500}

/* Blocks */
.dc-text{font-size:14px;color:#444;line-height:1.8;margin-bottom:16px}
.dc-text b{color:#333}
.dc-h3{font-size:16px;font-weight:700;color:#333;margin:24px 0 12px;padding-top:8px;border-top:1px solid #f0f0f0}

/* Code */
.dc-code-wrap{margin:12px 0 16px;border-radius:10px;overflow:hidden;border:1px solid #e8e8e8}
.dc-code-lang{background:#f5f7fa;padding:6px 14px;font-size:10px;color:#999;font-weight:600;text-transform:uppercase;border-bottom:1px solid #e8e8e8}
.dc-code{margin:0;padding:16px;background:#1e1e2e;color:#cdd6f4;font-size:12px;font-family:"Fira Code","Consolas","Monaco","Courier New",monospace;line-height:1.6;overflow-x:auto;white-space:pre}

/* Callouts */
.dc-callout{display:flex;gap:10px;padding:14px 16px;border-radius:8px;margin:12px 0 16px;font-size:13px;line-height:1.6;color:#555}
.dc-callout__icon{font-size:16px;flex-shrink:0;margin-top:1px}
.dc-callout--tip{background:#eaf4ee;border-left:3px solid #5d8a72}
.dc-callout--warn{background:#fff8e1;border-left:3px solid #f57c00}

/* Mini cards */
.dc-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:12px 0 16px}
@media(max-width:700px){.dc-cards{grid-template-columns:1fr}}
.dc-minicard{padding:12px 14px;border-radius:8px;border-left:3px solid;background:#fafbfc;transition:transform .2s}
.dc-minicard:hover{transform:translateY(-1px)}
.dc-minicard__title{font-size:13px;font-weight:700;color:#333;margin-bottom:4px}
.dc-minicard__desc{font-size:12px;color:#666;line-height:1.5}

/* Steps */
.dc-steps{display:flex;flex-direction:column;gap:8px;margin:12px 0 16px}
.dc-step{display:flex;gap:12px;align-items:flex-start}
.dc-step__num{width:24px;height:24px;border-radius:50%;background:#5d8a72;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
.dc-step__body{flex:1}
.dc-step__label{font-size:13px;font-weight:600;color:#333}
.dc-step__desc{font-size:12px;color:#888;line-height:1.5}

/* Table */
.dc-table-wrap{overflow-x:auto;margin:12px 0 16px}
.dc-table{width:100%;border-collapse:collapse;font-size:12px}
.dc-table th{padding:8px 12px;background:#f5f7fa;color:#555;font-weight:600;text-align:left;border-bottom:1px solid #e8e8e8}
.dc-table td{padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#333}
.dc-table code{font-family:"Fira Code","Consolas",monospace;font-size:11px;background:#f0f2f5;padding:1px 4px;border-radius:3px}

/* Diagrams */
.dc-diag-wrap{margin:16px 0;padding:16px;border:1px solid #e8e8e8;border-radius:10px;background:#fafbfc;overflow-x:auto}
.dc-diagram{max-width:100%;height:auto}
.dc-diagram--wide{min-width:500px}
.dc-diag-rect{animation:dcDiagIn .4s ease both}
@keyframes dcDiagIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
`;
