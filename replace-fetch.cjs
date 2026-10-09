const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.jsx', 'utf8');

code = code.replace(/const fetchAnalytics = useCallback\(async \([^)]*\) => \{[\s\S]*?\}, \[\]\);/m, 
`const fetchAnalytics = useCallback(async (silent = false) => {
    if (!silent) setAnalyticsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setAnalytics(mockAnalytics);
    setAnalyticsSource('Mock Data');
    setAnalyticsLoading(false);
  }, []);`);

code = code.replace(/const fetchAppointments = useCallback\(async \(\) => \{[\s\S]*?\}, \[\]\);/m, 
`const fetchAppointments = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setAppointments(mockAppointments);
    setLoading(false);
  }, []);`);

code = code.replace(/const fetchSchedule = useCallback\(async \(\) => \{[\s\S]*?\}, \[blockDate\]\);/m, 
`const fetchSchedule = useCallback(async () => {
    await new Promise(r => setTimeout(r, 400));
    setSchedule(mockSchedule);
    setAvailableSlots(mockSchedule.availableSlots || []);
    if (mockSchedule.availableSlots?.length > 0) {
      setBlockSlot(mockSchedule.availableSlots[0].slot);
    }
  }, [blockDate]);`);

code = code.replace(/const fetchFinancials = useCallback\(async \(\) => \{[\s\S]*?\}, \[\]\);/m, 
`const fetchFinancials = useCallback(async () => {
    await new Promise(r => setTimeout(r, 400));
    setFinancials(mockFinancials);
  }, []);`);

code = code.replace(/const fetchPrescriptions = useCallback\(async \(\) => \{[\s\S]*?\}, \[\]\);/m, 
`const fetchPrescriptions = useCallback(async () => {
    await new Promise(r => setTimeout(r, 400));
    setPrescriptions(mockPrescriptions);
  }, []);`);

fs.writeFileSync('src/components/AdminDashboard.jsx', code);
console.log('Replaced fetch functions');
