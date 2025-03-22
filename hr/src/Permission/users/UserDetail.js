import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../main/api';
import LoadingSpinner from '../../components/LoadingSpinner'; // Import the LoadingSpinner component
import Swal from "sweetalert2"; // استدعاء مكتبة SweetAlert2
import UserImage from '../../user.jpg';
import Sidebar from '../../components/Sidebar';

const UserDetail = () => {
  const { id } = useParams(); // معرف المستخدم من الرابط
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const companyCode = JSON.parse(localStorage.getItem('user'))?.company_id;

  useEffect(() => {
    if (!companyCode) {
      Swal.fire({
        title: 'خطأ!',
        text: 'لم يتم العثور على رمز الشركة.',
        icon: 'error',
        confirmButtonText: 'حسنًا',
      });
      setLoading(false);
      return;
    }

    // طلب API باستخدام رمز الشركة ومعرف المستخدم
    api.get(`/user/users/${companyCode}/${id}`)
      .then(response => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('خطأ في جلب تفاصيل المستخدم:', error.response ? error.response.data : error.message);
        Swal.fire({
          title: 'خطأ!',
          text: 'حدث خطأ أثناء جلب بيانات المستخدم.',
          icon: 'error',
          confirmButtonText: 'حسنًا',
        });
        setLoading(false);
      });
  }, [companyCode, id]); // إعادة الجلب عند تغيير رمز الشركة أو المعرف

  if (loading) {
    return <LoadingSpinner />; // عرض مؤشر التحميل أثناء جلب البيانات
  }

  if (!user) {
    return (
      <div className="container mt-1 text-center">
        <h3>المستخدم غير موجود</h3>
        <p>404 - المستخدم المطلوب غير موجود.</p>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="mobile-app-container p-3">
        <div className="border-0 shadow-lg card rounded-3">
          <div className="p-2 card-body">
            <div className="row g-4">
              {/* قسم صورة المستخدم */}
              <div className="text-center col-md-4">
                <div className="d-flex justify-content-center">
                  {user.image_path ? (
                    <img
                      src={`https://newhrsys-production.up.railway.app/storage/${user.image_path}`}
                      alt="المستخدم"
                      className="shadow-sm img-fluid rounded-circle"
                      style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                      onError={(e) => {
                        console.error("فشل تحميل الصورة:", e.target.src);
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <img
                      src={UserImage}
                      alt="المستخدم"
                      className="shadow-sm img-fluid rounded-circle"
                      style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                    />
                  )}
                </div>
              </div>

              {/* قسم معلومات المستخدم */}
              <div className="col-md-8">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>الرقم التعريفي:</strong>
                    <span>{user.id}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>الاسم:</strong>
                    <span>{`${user.first_name} ${user.middle_name || ''} ${user.last_name}`}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>رمز المستخدم:</strong>
                    <span>{user.user_code}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>الدور الوظيفي:</strong>
                    <span>{user.role?.name || 'غير متاح'}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>القسم:</strong>
                    <span>{user.department?.dep_name || 'غير متاح'}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>تاريخ الميلاد:</strong>
                    <span>{user.date_of_birth || 'غير متاح'}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>الحالة الاجتماعية:</strong>
                    <span>{user.marital_status || 'غير متاح'}</span>
                  </li>
                </ul>
              </div>

              {/* قسم المعلومات الإضافية */}
              <div className="col-md-12">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>الرقم الوطني:</strong>
                    <span>{user.national_id || 'غير متاح'}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>الراتب:</strong>
                    <span>{user.salary ? `$${user.salary}` : 'غير متاح'}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>العطل:</strong>
                    <span>{user.holidays || 'غير متاح'}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>إجازة مرضية:</strong>
                    <span>{user.sick_days || 'غير متاح'}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>إجازة سنوية:</strong>
                    <span>{user.annual_vacations_days || 'غير متاح'}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>معلومات إضافية:</strong>
                    <span>{user.additional_information || 'غير متاح'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetail;