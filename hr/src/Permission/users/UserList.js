import React, { useEffect, useState } from 'react';
import api from '../../main/api';
import Sidebar from '../../components/Sidebar';
import '../../css/ListUser.css';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import Swal from "sweetalert2"; // استدعاء مكتبة SweetAlert2

const userImage = '../../user.jpg';  // This will reference the image in the public folder
const permissions = JSON.parse(localStorage.getItem('permissions')) || [];

const companyCode = JSON.parse(localStorage.getItem('user'))?.company_id;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('table');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!companyCode) return;

    const cachedUsers = localStorage.getItem('users');

    if (cachedUsers) {
      setUsers(JSON.parse(cachedUsers));
      setIsLoading(false);
    } else {
      setIsLoading(true);
      api.get(`/user/usersc/${companyCode}`, {
        headers: { 'User-Permissions': JSON.stringify(permissions) } // Send permissions in headers
      })
        .then(response => {
          const usersData = Array.isArray(response.data) ? response.data : [response.data];
          setUsers(usersData);
          localStorage.setItem('users', JSON.stringify(usersData));  // Cache the data
        })
        .catch(error => {
          console.error('خطأ في جلب المستخدمين:', error);
          Swal.fire({
            title: 'خطأ!',
            text: 'حدث خطأ أثناء جلب بيانات المستخدمين.',
            icon: 'error',
            confirmButtonText: 'حسنًا',
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [companyCode]);

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (userId) => {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'لن تتمكن من استعادة هذه البيانات بعد الحذف!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذفه!',
      cancelButtonText: 'إلغاء',
    }).then((result) => {
      if (result.isConfirmed) {
        api.delete(`/user/users/${companyCode}/${userId}`)
          .then(() => {
            setUsers(users.filter(user => user.id !== userId));
            Swal.fire({
              title: 'محذوف!',
              text: 'تم حذف المستخدم بنجاح.',
              icon: 'success',
              confirmButtonText: 'حسنًا',
            });
          })
          .catch(error => {
            console.error('خطأ أثناء حذف المستخدم:', error);
            Swal.fire({
              title: 'خطأ!',
              text: 'حدث خطأ أثناء حذف المستخدم.',
              icon: 'error',
              confirmButtonText: 'حسنًا',
            });
          });
      }
    });
  };

  return (
    <div className="mobile-app-container">
      <Sidebar />
      <div className="search-container">
        <form className="w-100">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="بحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        <button
          className="btn btn-sm"
          onClick={() => setViewType(viewType === 'table' ? 'card' : 'table')}
        >
          التبديل إلى عرض {viewType === 'table' ? 'بطاقات' : 'جدول'}
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        viewType === 'table' ? (
          <div className="mt-1 table-responsive">
            <table className="table text-center table-hover table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>الصورة</th>
                  <th>الاسم الأول</th>
                  <th>اسم العائلة</th>
                  <th>الدور الوظيفي</th>
                  <th>القسم</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="me-3">
                        <img
                          src={userImage} // استخدم الصورة المحلية بدلاً من تحميلها من السيرفر
                          alt="المستخدم"
                          width="80"
                          height="80"
                          className="border rounded-circle"
                        />
                      </div>
                    </td>
                    <td>{user.first_name}</td>
                    <td>{user.last_name}</td>
                    <td>{user.role ? user.role.name : 'غير متاح'}</td>
                    <td>{user.department ? user.department.dep_name : 'غير متاح'}</td>
                    <td>
                      {permissions.includes('View_User') && (
                        <Link to={`/user/users/${user.id}`} className="btn btn-outline-primary btn-sm me-1">
                          <i className="bi bi-eye"></i>
                        </Link>
                      )}
                      {permissions.includes('Edit_User') && (
                        <Link to={`/user/users/edit/${user.id}`} className="btn btn-outline-warning btn-sm me-1">
                          <i className="bi bi-pencil"></i>
                        </Link>
                      )}
                      {permissions.includes('Delete_User') && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="row">
            {filteredUsers.map(user => (
              <div key={user.id} className="col-md-4">
                <div className="mb-3 border-0 shadow-sm card">
                  <div className="card-body d-flex align-items-center">
                    {/* Image */}
                    <div className="me-3">
                      <img
                        src={userImage} // استخدم الصورة المحلية بدلاً من تحميلها من السيرفر
                        alt="المستخدم"
                        width="80"
                        height="80"
                        className="border rounded-circle"
                      />
                    </div>

                    {/* User Info */}
                    <div>
                      <h6 className="fw-bold">{user.first_name} {user.last_name}</h6>
                      <p className="mb-1"><strong>الدور الوظيفي:</strong> {user.role ? user.role.name : 'غير متاح'}</p>
                      <p className="mb-1"><strong>القسم:</strong> {user.department ? user.department.dep_name : 'غير متاح'}</p>
                      <div className="d-flex">
                        <Link to={`/users/${user.id}`} className="btn btn-outline-primary btn-sm me-1">
                          <i className="bi bi-eye"></i>
                        </Link>
                        <Link to={`/users/edit/${user.id}`} className="btn btn-outline-warning btn-sm me-1">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        {permissions.includes('Delete_User') && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(user.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default UserList;