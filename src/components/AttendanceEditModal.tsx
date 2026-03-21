import { useEffect, useState } from "react";
import { adminService } from "../services/adminServices";
import { Loader2 } from "lucide-react";

const AttendanceEditModal = ({ isOpen, onClose, data, onRefresh }: any) => {
  const [formData, setFormData] = useState({
    check_in_time: "",
    check_out_time: "",
  });
  const [fetching, setFetching] = useState(false);

const getHHMM = (isoString: string | null | undefined) => {
  if (!isoString) return ""; 
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (e) {
    return "";
  }
};

  const combineDateAndTime = (originalIso: string, newTime: string) => {
    if (!newTime) return null;
    const date = new Date(originalIso);
    const [hours, minutes] = newTime.split(":");
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date.toISOString();
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (isOpen && data?.id) {
        setFetching(true);
        try {
          const response = await adminService.getAttendanceById(data.id);

          console.log("Detail Response:", response);

          const detail = response?.data || response;

          if (detail) {
            setFormData({
              check_in_time: getHHMM(detail?.check_in_time),
              check_out_time: getHHMM(detail?.check_out_time),
            });
          }
        } catch (err) {
          console.error("Gagal mengambil detail presensi", err);
        } finally {
          setFetching(false);
        }
      }
    };

    fetchDetail();
  }, [isOpen, data?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        check_in_time: combineDateAndTime(
          data.check_in_time,
          formData.check_in_time,
        ),
        check_out_time: formData.check_out_time
          ? combineDateAndTime(data.check_in_time, formData.check_out_time)
          : null,
      };

      await adminService.updateAttendance(data.id, payload);
      onRefresh();
      onClose();
    } catch (err) {
      alert("Gagal mengupdate data");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
        {fetching ? (
          <div className="py-10 text-center space-y-3">
            <Loader2 className="animate-spin mx-auto text-blue-600" size={32} />
            <p className="text-sm text-neutral-500 font-medium">
              Mengambil data terbaru...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-800">
              Edit Presensi
            </h3>
            <p className="text-xs text-neutral-500">
              Karyawan: <b>{data?.user?.name}</b>
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">
                Jam Masuk
              </label>
              <input
                type="time"
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500"
                value={formData.check_in_time}
                onChange={(e) =>
                  setFormData({ ...formData, check_in_time: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">
                Jam Keluar
              </label>
              <input
                type="time"
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500"
                value={formData.check_out_time}
                onChange={(e) =>
                  setFormData({ ...formData, check_out_time: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-sm font-bold text-neutral-500 hover:bg-neutral-50 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
              >
                Simpan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AttendanceEditModal;
