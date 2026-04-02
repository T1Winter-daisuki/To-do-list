import React, { useState, useEffect } from 'react';
import styles from './MoodPage.module.css';

const MONTHS = [
    { name: 'JAN', color: '#d5a6bd' }, { name: 'FEB', color: '#d5a6bd' }, { name: 'MAR', color: '#d5a6bd' },
    { name: 'APR', color: '#2ec5ca' }, { name: 'MAY', color: '#2ec5ca' }, { name: 'JUN', color: '#2ec5ca' },
    { name: 'JUL', color: '#f1c232' }, { name: 'AUG', color: '#f1c232' }, { name: 'SEP', color: '#f1c232' },
    { name: 'OCT', color: '#4a86e8' }, { name: 'NOV', color: '#4a86e8' }, { name: 'DEC', color: '#4a86e8' }
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const MOOD = {
    'A+': { color: '#2ca02c', score: 4.0, desc: 'Positive core memory' },
    'A':  { color: '#22c55e', score: 3.5, desc: 'Very positive' },
    'B+': { color: '#86efac', score: 3.2, desc: 'Positive' },
    'B':  { color: '#bbf7d0', score: 3.0, desc: 'Good' },
    'C':  { color: '#fde047', score: 2.5, desc: 'Neutral' },
    'D':  { color: '#fbbf24', score: 2.0, desc: 'Negative' },
    'F':  { color: '#ef4444', score: 0.0, desc: 'Very negative' }
};

const AvgMood = (avgScore) => {
    if (avgScore >= 3.7) return 'A+';
    if (avgScore >= 3.5) return 'A';
    if (avgScore >= 3.2) return 'B+';
    if (avgScore >= 3.0) return 'B';
    if (avgScore >= 2.5) return 'C';
    if (avgScore >= 2.0) return 'D';
    if (avgScore >= 0.0) return 'F';
    return '';
};

const MoodPage = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [moods, setMoods] = useState({});
    const [activeBrush, setActiveBrush] = useState('C');
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    const isValidDate = (day, monthIndex) => {
        const date = new Date(selectedYear, monthIndex, day);
        return date.getMonth() === monthIndex;
    };

    const paintCell = (day, monthIndex) => {
        const key = `${monthIndex}-${day}`;
        setMoods(prev => {
            if (activeBrush !== 'ERASE' && prev[key] === activeBrush) return prev; 
            if (activeBrush === 'ERASE' && !prev[key]) return prev;

            const newMoods = { ...prev };
            if (activeBrush === 'ERASE') {
                delete newMoods[key];
            } else {
                newMoods[key] = activeBrush;
            }
            return newMoods;
        });
    };

    const handleMouseDown = (day, monthIndex) => {
        setIsDragging(true);
        paintCell(day, monthIndex);
    };

    const handleMouseEnter = (day, monthIndex) => {
        if (isDragging) {
            paintCell(day, monthIndex);
        }
    };

    const calculateMonthME = (monthIndex) => {
        let totalScore = 0;
        let filledCount = 0;
        let validDaysCount = 0; 

        DAYS.forEach(day => {
            if (isValidDate(day, monthIndex)) {
                validDaysCount++;
                const mood = moods[`${monthIndex}-${day}`];
                if (mood && MOOD[mood]) {
                    totalScore += MOOD[mood].score;
                    filledCount++;
                }
            }
        });

        if (filledCount === 0 || filledCount < validDaysCount) return ''; 
        return AvgMood(totalScore / filledCount);
    };

    const calculateStats = () => {
        const isLeapYear = (selectedYear % 4 === 0 && selectedYear % 100 !== 0) || (selectedYear % 400 === 0);
        const totalDaysInYear = isLeapYear ? 366 : 365;

        const counts = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
        Object.values(moods).forEach(mood => {
            if (counts[mood] !== undefined) 
                counts[mood]++;
        });

        return Object.keys(counts).map(key => ({
            mood: key,
            count: counts[key],
            percent: ((counts[key] / totalDaysInYear) * 100).toFixed(2)
        }));
    };

    const stats = calculateStats();
    const startYear = 2026;
    const currentSystemYear = new Date().getFullYear();
    const totalYears = (currentSystemYear - startYear) + 7; 

    const years = Array.from({ length: totalYears }, (_, i) => startYear + i);

    return (
        <div className={styles.wrapper}>
            <div className={styles.headerArea}>
                <select 
                    className={styles.yearSelect} 
                    value={selectedYear} 
                    onChange={(e) => {
                        setSelectedYear(Number(e.target.value));
                        setMoods({});
                    }}
                >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <span className={styles.titleText}> MOOD TRACKER</span>
            </div>

            <div className={styles.contentArea}>
                {/* Trái */}
                <div className={styles.mainBoard}>
                    <table className={styles.mainTable} onMouseLeave={() => setIsDragging(false)}>
                        <thead>
                            <tr>
                                <th className={styles.dayCell}></th>
                                {MONTHS.map((month) => (
                                    <th key={month.name} className={styles.monthCell} style={{ backgroundColor: month.color, color: '#fff', fontSize: '15px' }}>
                                        {month.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DAYS.map(day => (
                                <tr key={day}>
                                    <td className={styles.dayCell} style={{ color: '#fff', fontSize: '14px' }} >{day}</td>
                                    {MONTHS.map((month, monthIndex) => {
                                        const valid = isValidDate(day, monthIndex);
                                        const mood = moods[`${monthIndex}-${day}`];
                                        
                                        return (
                                            <td 
                                                key={`${monthIndex}-${day}`}
                                                className={valid ? styles.validCell : styles.invalidCell}
                                                style={{ backgroundColor: mood ? MOOD[mood].color : (valid ? '#ffffff' : '#222222') }}
                                                onMouseDown={() => valid && handleMouseDown(day, monthIndex)}
                                                onMouseEnter={() => valid && handleMouseEnter(day, monthIndex)}
                                            >
                                                {mood || ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            
                            {/* Dòng phân cách */}
                            <tr style={{ height: '2vh', backgroundColor: 'transparent' }}>
                                <td colSpan={13} style={{ border: 'none' }}></td>
                            </tr>

                            {/* ME */}
                            <tr>
                                <td className={styles.meCell}>ME</td>
                                {MONTHS.map((month, monthIndex) => {
                                    const meResult = calculateMonthME(monthIndex);
                                    return (
                                        <td 
                                            key={`ME-${monthIndex}`}
                                            style={{ backgroundColor: meResult ? MOOD[meResult].color : '#ffffff', fontSize: '14px' }}
                                        >
                                            {meResult || ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Phải*/}
                <div className={styles.sidePanel}>
                    <table className={styles.statsTable}>
                        <thead>
                            <tr style={{ backgroundColor: '#b5ad9e' }}>
                                <th style={{ width: '15%' }}></th>
                                <th style={{ width: '15%', color: '#f2eaca', fontSize: '14px' }}>Days</th>
                                <th style={{ width: '45%' }}></th>
                                <th style={{ width: '25%', color: '#f2eaca', fontSize: '14px' }}>Percentage</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map(stat => (
                                <tr key={stat.mood}>
                                    <td style={{ backgroundColor: MOOD[stat.mood].color, fontWeight: 'bold', color: '#000000', fontSize: '14px' }}>{stat.mood}</td>
                                    <td style={{ fontSize: '14px'}}>{stat.count}</td>
                                    <td>
                                        <div className={styles.progressBarContainer}>
                                            <div className={styles.progressBar} style={{ width: `${stat.percent}%`, backgroundColor: '#fdd68d' }}></div>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '14px'}}>{stat.percent}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className={styles.legend}>
                        <div className={styles.legendTitle}>Brush</div>
                        {Object.keys(MOOD).map(key => (
                            <div 
                                key={key} 
                                className={`${styles.legendRow} ${activeBrush === key ? styles.activeBrush : ''}`}
                                onClick={() => setActiveBrush(key)}
                            >
                                <div className={styles.colorBox} style={{ backgroundColor: MOOD[key].color }}>{key}</div>
                                <span>{MOOD[key].desc}</span>
                            </div>
                        ))}
                        <div 
                            className={`${styles.legendRow} ${activeBrush === 'ERASE' ? styles.activeBrush : ''}`}
                            onClick={() => setActiveBrush('ERASE')}
                            style={{ marginTop: '1.5vh', borderTop: '1px dashed #ccc', paddingTop: '1.5vh' }}
                        >
                            <div className={styles.colorBox} style={{ backgroundColor: 'white' }}>X</div>
                            <span style={{ fontWeight: 'bold' }}>Delete</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoodPage;