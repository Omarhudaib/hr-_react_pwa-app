import React, { useState, useEffect } from 'react';
import api from '../../main/api';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import Sidebar from '../../components/Sidebar';
import Swal from "sweetalert2"; // استدعاء مكتبة SweetAlert2

const EditUser = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        user_code: '',
        password: '',
        role_id: '',
        department_id: '',
        additional_information: '',
        second_name: '',
        middle_name: '',
        image_path: '',
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
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const companyCode = JSON.parse(localStorage.getItem('user'))?.company_id;
        if (token && companyCode) {
            Promise.all([
                api.get(`/user/users/${companyCode}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                api.get(`/user/role/${companyCode}`, { headers: { Authorization: `Bearer ${token}` } }),
                api.get(`/user/departments/${companyCode}`, { headers: { Authorization: `Bearer ${token}` } }),
            ])
                .then(([userResponse, rolesResponse, departmentsResponse]) => {
                    const userData = userResponse.data;
                    setFormData({
                        ...userData,
                        role_id: userData.role?.id || '',
                        department_id: userData.department?.id || '',
                        image_path: userData.image_path || '',
                    });
                    setRoles(rolesResponse.data);
                    setDepartments(departmentsResponse.data);
                    setLoading(false);
                })
                .catch(() => {
                    Swal.fire({
                        title: 'خطأ!',
                        text: 'فشل في جلب البيانات. حاول مرة أخرى.',
                        icon: 'error',
                        confirmButtonText: 'حسنًا',
                    });
                    setLoading(false);
                });
        } else {
            Swal.fire({
                title: 'خطأ!',
                text: 'لم يتم العثور على رمز المصادقة.',
                icon: 'error',
                confirmButtonText: 'حسنًا',
            });
            setLoading(false);
        }
    }, [id]);

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        setErrors({ ...errors, [field]: '' });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image_path: file });
        } else {
            setFormData({ ...formData, image_path: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const user = JSON.parse(localStorage.getItem('user'));
        if (!token || !user) {
            Swal.fire({
                title: 'خطأ!',
                text: 'الرجاء تسجيل الدخول.',
                icon: 'error',
                confirmButtonText: 'حسنًا',
            });
            return;
        }
        try {
            const formDataToSend = new FormData();
            // Append only the required fields
            const fields = [
                'first_name', 'last_name', 'user_code', 'password', 'role_id', 'department_id',
                'additional_information', 'second_name', 'middle_name', 'national_id',
                'marital_status', 'attendtaby', 'date_of_birth', 'holidays', 'salary',
                'sick_days', 'annual_vacations_days',
            ];
            fields.forEach((field) => {
                if (formData[field] !== null && formData[field] !== undefined) {
                    formDataToSend.append(field, formData[field]);
                }
            });
            // Append required fields
            formDataToSend.append('id', id);
            formDataToSend.append('company_code', user.company_id);
            formDataToSend.append('company_id', user.company_id);
            // Append the image file if it exists
            if (formData.image_path instanceof File) {
                formDataToSend.append('image_path', formData.image_path);
            }
            // Make the API call to update the user
            const companyCode = JSON.parse(localStorage.getItem('user'))?.company_id;
            const response = await api.post(`/user/users/update/${companyCode}`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.status === 200) {
                Swal.fire({
                    title: 'نجاح!',
                    text: 'تم تحديث بيانات المستخدم بنجاح.',
                    icon: 'success',
                    confirmButtonText: 'حسنًا',
                });
                navigate('/users');
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
                Swal.fire({
                    title: 'خطأ!',
                    text: 'يرجى تصحيح الأخطاء التالية.',
                    icon: 'error',
                    confirmButtonText: 'حسنًا',
                });
            } else {
                Swal.fire({
                    title: 'خطأ!',
                    text: 'فشل في تحديث بيانات المستخدم. حاول مرة أخرى.',
                    icon: 'error',
                    confirmButtonText: 'حسنًا',
                });
            }
        }
    };

    return (
        <>
            <Sidebar />
            <div className="mobile-app-container p-3">
                <h2 className='mb-4 text-center text-primary'>تعديل المستخدم</h2>
                {loading ? <LoadingSpinner /> : (
                    <form onSubmit={handleSubmit}>
                        {/* عرض الأخطاء */}
                        {Object.keys(errors).map((key) => (
                            errors[key] && <div key={key} className="alert alert-danger">{errors[key]}</div>
                        ))}
                        {/* 1. بيانات الاسم الكامل */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>الاسم الأول</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.first_name || ''}
                                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>اسم الأب</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.middle_name || ''}
                                        onChange={(e) => handleInputChange('middle_name', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>اسم العائلة</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.last_name || ''}
                                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>اسم الجد</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.second_name || ''}
                                        onChange={(e) => handleInputChange('second_name', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* 2. صورة المستخدم */}
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label>الصورة</label>
                                    <input type="file" className="form-control" onChange={handleFileChange} />
                                </div>
                            </div>
                        </div>
                        {/* 3. بيانات المصادقة */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>رمز المستخدم</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.user_code || ''}
                                        onChange={(e) => handleInputChange('user_code', e.target.value)}
                                    />
                                    {errors.user_code && <small className="text-danger">{errors.user_code}</small>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>كلمة المرور</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={formData.password || ''}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                    />
                                    {errors.password && <small className="text-danger">{errors.password}</small>}
                                </div>
                            </div>
                        </div>
                        {/* 4. الانتماء التنظيمي */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>الدور الوظيفي</label>
                                    <select
                                        className="form-control"
                                        value={formData.role_id || ''}
                                        onChange={(e) => handleInputChange('role_id', e.target.value)}
                                    >
                                        <option value="">اختر الدور الوظيفي</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.role_id && <small className="text-danger">{errors.role_id}</small>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>القسم</label>
                                    <select
                                        className="form-control"
                                        value={formData.department_id || ''}
                                        onChange={(e) => handleInputChange('department_id', e.target.value)}
                                    >
                                        <option value="">اختر القسم</option>
                                        {departments.map((department) => (
                                            <option key={department.id} value={department.id}>
                                                {department.dep_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.department_id && <small className="text-danger">{errors.department_id}</small>}
                                </div>
                            </div>
                        </div>
                        {/* 5. بيانات شخصية إضافية */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>الرقم الوطني</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.national_id || ''}
                                        onChange={(e) => handleInputChange('national_id', e.target.value)}
                                    />
                                    {errors.national_id && <small className="text-danger">{errors.national_id}</small>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>الحالة الاجتماعية</label>
                                    <select
                                        className="form-control"
                                        value={formData.marital_status || ''}
                                        onChange={(e) => handleInputChange('marital_status', e.target.value)}
                                    >
                                        <option value="">اختر الحالة الاجتماعية</option>
                                        <option value="single">أعزب</option>
                                        <option value="married">متزوج</option>
                                        <option value="divorced">مطلق</option>
                                        <option value="widowed">أرمل</option>
                                    </select>
                                    {errors.marital_status && <small className="text-danger">{errors.marital_status}</small>}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>تاريخ الميلاد</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.date_of_birth || ''}
                                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                                    />
                                    {errors.date_of_birth && <small className="text-danger">{errors.date_of_birth}</small>}
                                </div>
                            </div>
                        </div>
                        {/* 6. بيانات العمل */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>الراتب</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.salary || ''}
                                        onChange={(e) => handleInputChange('salary', e.target.value)}
                                    />
                                    {errors.salary && <small className="text-danger">{errors.salary}</small>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>العطل</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.holidays || ''}
                                        onChange={(e) => handleInputChange('holidays', e.target.value)}
                                    />
                                    {errors.holidays && <small className="text-danger">{errors.holidays}</small>}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>إجازة مرضية</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.sick_days || ''}
                                        onChange={(e) => handleInputChange('sick_days', e.target.value)}
                                    />
                                    {errors.sick_days && <small className="text-danger">{errors.sick_days}</small>}
                                </div>
                            </div>
                        </div>
                        {/* 7. إعدادات الحضور */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>نوع الحضور</label>
                                    <select
                                        className="form-control"
                                        value={formData.attendtaby || ''}
                                        onChange={(e) => handleInputChange('attendtaby', e.target.value)}
                                    >
                                        <option value="">اختر نوع الحضور</option>
                                        <option value="any location">أي موقع</option>
                                        <option value="dep location">موقع القسم</option>
                                    </select>
                                    {errors.attendtaby && <small className="text-danger">{errors.attendtaby}</small>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>نوع الوظيفة لدامان</label>
                                    <select
                                        className="form-control"
                                        value={formData.work_type || ''}
                                        onChange={(e) => handleInputChange('work_type', e.target.value)}
                                    >
                                        <option value="normal">عادي</option>
                                        <option value="hazardous">خطر</option>
                                    </select>
                                    {errors.work_type && <small className="text-danger">{errors.work_type}</small>}
                                </div>
                            </div>
                        </div>
                        {/* 8. معلومات إضافية */}
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label>معلومات إضافية</label>
                                    <textarea
                                        className="form-control"
                                        value={formData.additional_information || ''}
                                        onChange={(e) => handleInputChange('additional_information', e.target.value)}
                                    />
                                    {errors.additional_information && (
                                        <small className="text-danger">{errors.additional_information}</small>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* زر الإرسال */}
                        <div className="form-group">
                            <button type="submit" className="btn btn-primary">
                                تحديث المستخدم
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
};

export default EditUser;