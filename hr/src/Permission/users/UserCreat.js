import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../main/api'; // استدعاء API من الملف
import Swal from "sweetalert2"; // استدعاء مكتبة SweetAlert2
import LoadingSpinner from '../../components/LoadingSpinner'; // Import the LoadingSpinner component
import Sidebar from '../../components/Sidebar';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_id: '',
    first_name: '',
    last_name: '',
    second_name: '',
    middle_name: '',
    user_code: '',
    password: '',
    role_id: '',
    department_id: '',
    additional_information: '',
    image_path: null,
    national_id: '',
    marital_status: '',
    attendtaby: '',
    date_of_birth: '',
    holidays: '',
    salary: '',
    sick_days: '',
    annual_vacations_days: '',
    work_type: '',
  });
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const companyCode = JSON.parse(localStorage.getItem('user'))?.company_id;

  useEffect(() => {
    const companyData = JSON.parse(localStorage.getItem('user'));
    if (companyData && companyData.id) {
      setFormData((prev) => ({ ...prev, company_id: companyData.id }));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const storedRoles = localStorage.getItem('roles');
    const storedDepartments = localStorage.getItem('departments');
    if (storedRoles && storedDepartments) {
      setRoles(JSON.parse(storedRoles));
      setDepartments(JSON.parse(storedDepartments));
      setLoading(false);
    } else {
      // إجراء الاتصال بـ API فقط في حالة عدم وجود البيانات
      api.get(`/user/role/${companyCode}`).then((response) => {
        localStorage.setItem('roles', JSON.stringify(response.data));
        setRoles(response.data);
      });
      api.get(`/user/departments/${companyCode}`).then((response) => {
        localStorage.setItem('departments', JSON.stringify(response.data));
        setDepartments(response.data);
      });
    }
  }, [companyCode]);

  useEffect(() => {
    if (id) {
      const fetchUserData = async () => {
        try {
          const response = await api.get(`/user/users/${companyCode}/${id}`);
          setFormData(response.data);
        } catch (error) {
          console.error('خطأ في جلب بيانات المستخدم:', error);
        }
      };
      fetchUserData();
    }
  }, [id, companyCode]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formDataToSend.append(key, value);
      }
    });

    try {
      if (id) {
        // تحديث بيانات المستخدم الحالي
        await api.put(`/user/users/${companyCode}/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        Swal.fire({
          title: 'نجاح!',
          text: 'تم تحديث بيانات المستخدم بنجاح.',
          icon: 'success',
          confirmButtonText: 'حسنًا',
        });
      } else {
        // إنشاء مستخدم جديد
        await api.post(`/user/users/${companyCode}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        Swal.fire({
          title: 'نجاح!',
          text: 'تم إنشاء المستخدم بنجاح.',
          icon: 'success',
          confirmButtonText: 'حسنًا',
        });
      }
      navigate('/users');
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
        Swal.fire({
          title: 'خطأ!',
          text: 'يرجى تصحيح الأخطاء التالية.',
          icon: 'error',
          confirmButtonText: 'حسنًا',
        });
      } else {
        console.error('خطأ أثناء حفظ بيانات المستخدم:', error);
        Swal.fire({
          title: 'خطأ!',
          text: 'حدث خطأ أثناء حفظ بيانات المستخدم.',
          icon: 'error',
          confirmButtonText: 'حسنًا',
        });
      }
    }
  };

  return loading ? (
    <LoadingSpinner />
  ) : (
    <>
      <Sidebar />
      <div className="mobile-app-container p-3">
        <div className="row">
          <h1 className="mb-5 text-center col-12 lg-sm">
            {id ? 'تعديل المستخدم' : 'إنشاء مستخدم'}
          </h1>
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="col-12">
            {/* قسم المعلومات الشخصية */}
            <div className="mb-3 row">
              <div className="col-md-3">
                <label className="form-label">الاسم الأول</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="form-control"
                />
                {errors.first_name && <div className="text-danger">{errors.first_name}</div>}
              </div>
              <div className="col-md-3">
                <label className="form-label">اسم الأب</label>
                <input
                  type="text"
                  value={formData.middle_name}
                  onChange={(e) => handleInputChange('middle_name', e.target.value)}
                  className="form-control"
                />
                {errors.middle_name && <div className="text-danger">{errors.middle_name}</div>}
              </div>
              <div className="col-md-3">
                <label className="form-label">اسم العائلة</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="form-control"
                />
                {errors.last_name && <div className="text-danger">{errors.last_name}</div>}
              </div>
              <div className="col-md-3">
                <label className="form-label">اسم الجد</label>
                <input
                  type="text"
                  value={formData.second_name}
                  onChange={(e) => handleInputChange('second_name', e.target.value)}
                  className="form-control"
                />
                {errors.second_name && <div className="text-danger">{errors.second_name}</div>}
              </div>
            </div>
            {/* قسم المصادقة */}
            <div className="mb-3 row">
              <div className="col-md-6">
                <label className="form-label">رمز المستخدم</label>
                <input
                  type="text"
                  value={formData.user_code}
                  onChange={(e) => handleInputChange('user_code', e.target.value)}
                  className="form-control"
                />
                {errors.user_code && <div className="text-danger">{errors.user_code}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">كلمة المرور</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="form-control"
                />
                {errors.password && <div className="text-danger">{errors.password}</div>}
              </div>
            </div>
            {/* القسم التنظيمي */}
            <div className="mb-3 row">
              <div className="col-md-6">
                <label className="form-label">الدور الوظيفي</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => handleInputChange('role_id', e.target.value)}
                  className="form-select"
                >
                  <option value="">اختر الدور الوظيفي</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {errors.role_id && <div className="text-danger">{errors.role_id}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">القسم</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => handleInputChange('department_id', e.target.value)}
                  className="form-select"
                >
                  <option value="">اختر القسم</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.dep_name}
                    </option>
                  ))}
                </select>
                {errors.department_id && <div className="text-danger">{errors.department_id}</div>}
              </div>
            </div>
            {/* صورة الملف الشخصي */}
            <div className="mb-3 row">
              <div className="col-12">
                <label className="form-label">صورة الملف الشخصي</label>
                <input
                  type="file"
                  onChange={(e) => handleInputChange('image_path', e.target.files[0])}
                  className="form-control"
                  accept="image/*"
                />
                {errors.image_path && <div className="text-danger">{errors.image_path}</div>}
              </div>
            </div>
            {/* تفاصيل شخصية */}
            <div className="mb-3 row">
              <div className="col-md-6">
                <label className="form-label">الرقم الوطني</label>
                <input
                  type="text"
                  value={formData.national_id}
                  onChange={(e) => handleInputChange('national_id', e.target.value)}
                  className="form-control"
                />
                {errors.national_id && <div className="text-danger">{errors.national_id}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">الحالة الاجتماعية</label>
                <select
                  value={formData.marital_status}
                  onChange={(e) => handleInputChange('marital_status', e.target.value)}
                  className="form-select"
                >
                  <option value="">اختر الحالة الاجتماعية</option>
                  <option value="single">أعزب</option>
                  <option value="married">متزوج</option>
                  <option value="divorced">مطلق</option>
                </select>
                {errors.marital_status && <div className="text-danger">{errors.marital_status}</div>}
              </div>
            </div>
            <div className="mb-3 row">
              <div className="col-md-6">
                <label className="form-label">تاريخ الميلاد</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="form-control"
                />
                {errors.date_of_birth && <div className="text-danger">{errors.date_of_birth}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">إجازة سنوية</label>
                <input
                  type="number"
                  value={formData.annual_vacations_days}
                  onChange={(e) => handleInputChange('annual_vacations_days', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            {/* تفاصيل العمل */}
            <div className="mb-3 row">
              <div className="col-md-4">
                <label className="form-label">الراتب</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  className="form-control"
                />
                {errors.salary && <div className="text-danger">{errors.salary}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label">العطل</label>
                <input
                  type="number"
                  value={formData.holidays}
                  onChange={(e) => handleInputChange('holidays', e.target.value)}
                  className="form-control"
                />
                {errors.holidays && <div className="text-danger">{errors.holidays}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label">إجازة مرضية</label>
                <input
                  type="number"
                  value={formData.sick_days}
                  onChange={(e) => handleInputChange('sick_days', e.target.value)}
                  className="form-control"
                />
                {errors.sick_days && <div className="text-danger">{errors.sick_days}</div>}
              </div>
            </div>
            {/* إعدادات الحضور */}
            <div className="mb-3 row">
              <div className="col-md-6">
                <label className="form-label">نوع الحضور</label>
                <select
                  value={formData.attendtaby || ''}
                  onChange={(e) => handleInputChange('attendtaby', e.target.value)}
                  className="form-select"
                >
                  <option value="">اختر نوع الحضور</option>
                  <option value="any location">أي موقع</option>
                  <option value="dep location">موقع القسم</option>
                </select>
                {errors.attendtaby && <div className="text-danger">{errors.attendtaby}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">نوع الوظيفة لدامان</label>
                <select
                  value={formData.work_type || ''}
                  onChange={(e) => handleInputChange('work_type', e.target.value)}
                  className="form-select"
                >
                  <option value="normal">عادي</option>
                  <option value="hazardous">خطر</option>
                </select>
                {errors.work_type && <div className="text-danger">{errors.work_type}</div>}
              </div>
            </div>
            {/* معلومات إضافية */}
            <div className="mb-3 row">
              <div className="col-12">
                <label className="form-label">معلومات إضافية</label>
                <textarea
                  value={formData.additional_information}
                  onChange={(e) => handleInputChange('additional_information', e.target.value)}
                  className="form-control"
                  rows={3}
                />
                {errors.additional_information && (
                  <div className="text-danger">{errors.additional_information}</div>
                )}
              </div>
            </div>
            {/* زر الإرسال */}
            <div className="row">
              <div className="content-center col-12 d-flex justify-content-center">
                <button type="submit" className="btn btn-primary">
                  {id ? 'تحديث المستخدم' : 'إنشاء المستخدم'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UserForm;