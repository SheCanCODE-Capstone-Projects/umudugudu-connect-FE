'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { IsiboAttendance } from '@/types';

interface AttendanceChartProps {
  data: IsiboAttendance[];
}

export const AttendanceChart = ({ data }: AttendanceChartProps) => {
  const chartData = data.map((isibo) => ({
    name:    isibo.isiboName,
    Present: isibo.totalPresent,
    Absent:  isibo.totalAbsent,
    Rate:    isibo.percentage,
  }));

  return (
    <div className="flex flex-col gap-6">

      {/* Bar Chart */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Attendance by Isibo
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Present" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Absent"  fill="#F87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Isibo Table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Isibo Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-4 py-2 rounded-tl-lg">Isibo</th>
                <th className="text-center px-4 py-2">Invited</th>
                <th className="text-center px-4 py-2">Present</th>
                <th className="text-center px-4 py-2">Absent</th>
                <th className="text-center px-4 py-2 rounded-tr-lg">Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((isibo, i) => (
                <tr
                  key={isibo.isiboId}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-2 font-medium text-gray-900">{isibo.isiboName}</td>
                  <td className="px-4 py-2 text-center text-gray-600">{isibo.totalInvited}</td>
                  <td className="px-4 py-2 text-center text-green-600 font-medium">{isibo.totalPresent}</td>
                  <td className="px-4 py-2 text-center text-red-500 font-medium">{isibo.totalAbsent}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isibo.percentage >= 75
                        ? 'bg-green-100 text-green-700'
                        : isibo.percentage >= 50
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {isibo.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};