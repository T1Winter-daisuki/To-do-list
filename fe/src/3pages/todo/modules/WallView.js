import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from './Wall.module.css';

// Hàm helper để render ngày giờ đẹp hơn
const formatShortDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// Mảng class màu sắc và độ nghiêng cho các tờ note
const noteColors = [styles.colorYellow, styles.colorPink, styles.colorGreen, styles.colorBlue];
const noteRotations = [styles.rotateLeft1, styles.rotateLeft2, styles.rotateRight1, styles.rotateRight2, ''];

const StickyWall = () => {
    const { tasks, setDetailTask } = useOutletContext();
    
    // Lưu trữ vị trí do người dùng tự kéo thả (Ghi đè logic tự động)
    // Thực tế bạn có thể lưu cái này vào localStorage để F5 không bị mất
    const [overrides, setOverrides] = useState({});
    const [draggedTaskId, setDraggedTaskId] = useState(null);

    // 1. LOGIC PHÂN LOẠI TASK (Tự động + Thủ công)
    const getTaskQuadrant = (task) => {
        // Nếu người dùng đã tự kéo thả, ưu tiên vị trí người dùng chọn
        if (overrides[task.id]) return overrides[task.id];

        // Nếu chưa kéo thả, tự động tính toán dựa trên Deadline
        if (!task.deadline) return 'q4'; // Không có hạn -> Bỏ xó góc 4

        const now = new Date();
        const dl = new Date(task.deadline);
        const diffHours = (dl - now) / (1000 * 60 * 60);

        if (diffHours <= 48) return 'q1'; // Dưới 48h hoặc quá hạn -> Gấp -> Góc 1
        return 'q2'; // Còn nhiều thời gian -> Quan trọng nhưng chưa gấp -> Góc 2
    };

    // Nhóm các task vào 4 góc
    const quadrantsData = useMemo(() => {
        const q = { q1: [], q2: [], q3: [], q4: [] };
        (tasks || []).forEach(task => {
            // Ẩn các task đã hoàn thành cho bảng ghim đỡ rác
            if (task.is_completed) return; 
            
            const quadrantId = getTaskQuadrant(task);
            if (q[quadrantId]) q[quadrantId].push(task);
        });
        return q;
    }, [tasks, overrides]);

    // 2. CÁC HÀM XỬ LÝ KÉO THẢ (DRAG & DROP)
    const handleDragStart = (e, taskId) => {
        setDraggedTaskId(taskId);
        // Lưu data ID của task đang bị kéo
        e.dataTransfer.setData('text/plain', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Cần thiết để cho phép Drop
        e.dataTransfer.dropEffect = 'move';
        // Có thể thêm class đổi màu nền góc khi đang lướt chuột qua (nếu muốn)
    };

    const handleDrop = (e, quadrantId) => {
        e.preventDefault();
        const taskId = parseInt(e.dataTransfer.getData('text/plain'), 10);
        
        if (taskId) {
            // Cập nhật vị trí mới do người dùng ấn định
            setOverrides(prev => ({
                ...prev,
                [taskId]: quadrantId
            }));
        }
        setDraggedTaskId(null);
    };

    // 3. RENDER MỘT GÓC PHẦN TƯ (QUADRANT)
    const renderQuadrant = (id, title, desc, tasksList) => (
        <div 
            className={`${styles.quadrant} ${styles[id]}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, id)}
        >
            <div className={styles.quadrantTitle}>
                {title} <br/> <span style={{fontSize: '11px', fontWeight: 'normal'}}>{desc}</span>
            </div>
            
            <div className={styles.notesContainer}>
                {tasksList.map(task => {
                    // Tạo màu và độ nghiêng ngẫu nhiên "có chủ đích" dựa vào ID để không bị giật khi render lại
                    const colorClass = noteColors[task.id % noteColors.length];
                    const rotateClass = noteRotations[task.id % noteRotations.length];
                    const isDragging = draggedTaskId === task.id;

                    return (
                        <div 
                            key={task.id}
                            className={`${styles.stickyNote} ${colorClass} ${rotateClass}`}
                            style={{ opacity: isDragging ? 0.4 : 1 }}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragEnd={() => setDraggedTaskId(null)}
                            onClick={() => setDetailTask(task)} // Bấm vào để xem/sửa chi tiết
                        >
                            <div className={styles.pin}></div>
                            <div className={styles.noteTitle}>{task.title}</div>
                            <div className={styles.noteDesc}>{task.description}</div>
                            <div className={styles.noteDate}>
                                {task.deadline ? formatShortDate(task.deadline) : 'Không có hạn'}
                            </div>
                        </div>
                    );
                })}
                {tasksList.length === 0 && (
                    <div style={{width: '100%', textAlign: 'center', color: '#aaa', fontStyle: 'italic', fontSize: '12px', marginTop: '20px'}}>
                        Kéo thả giấy nhớ vào đây
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className={styles.wallContainer}>
            <div className={styles.wallHeader}>
                <h1 className={styles.pageTitle}>Sticky Wall</h1>
            </div>

            <div className={styles.matrixGrid}>
                {/* Góc 1: Đỏ */}
                {renderQuadrant('q1', 'DO', '(Khẩn cấp & Quan trọng)', quadrantsData.q1)}
                
                {/* Góc 2: Xanh lá */}
                {renderQuadrant('q2', 'DECIDE', '(Không Khẩn cấp nhưng Quan trọng)', quadrantsData.q2)}
                
                {/* Góc 3: Vàng */}
                {renderQuadrant('q3', 'DELEGATE', '(Khẩn cấp nhưng Không Quan trọng)', quadrantsData.q3)}
                
                {/* Góc 4: Xám */}
                {renderQuadrant('q4', 'DELETE', '(Không Khẩn cấp & Không Quan trọng)', quadrantsData.q4)}
            </div>
        </div>
    );
};

export default StickyWall;