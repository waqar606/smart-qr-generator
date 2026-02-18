import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, ScanLine, Users } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, subDays, startOfDay, isAfter } from 'date-fns';

interface Scan {
  id: string;
  qr_code_id: string;
  scanned_at: string;
  operating_system: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
}

interface QRCode {
  id: string;
  name: string;
}

const COLORS = ['hsl(152, 69%, 42%)', 'hsl(210, 70%, 50%)', 'hsl(40, 90%, 55%)', 'hsl(0, 70%, 55%)', 'hsl(280, 60%, 55%)', 'hsl(180, 50%, 45%)'];

const PERIOD_OPTIONS = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 90 days', value: '90' },
];

export default function Analytics() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [period, setPeriod] = useState('7');
  const [selectedQR, setSelectedQR] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [scansRes, qrRes] = await Promise.all([
        supabase.from('qr_scans').select('*').order('scanned_at', { ascending: false }),
        supabase.from('qr_codes').select('id, name'),
      ]);
      setScans((scansRes.data as Scan[]) || []);
      setQrCodes((qrRes.data as QRCode[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const filteredScans = useMemo(() => {
    const cutoff = startOfDay(subDays(new Date(), parseInt(period)));
    return scans.filter(s => {
      const afterCutoff = isAfter(new Date(s.scanned_at), cutoff);
      const matchesQR = selectedQR === 'all' || s.qr_code_id === selectedQR;
      return afterCutoff && matchesQR;
    });
  }, [scans, period, selectedQR]);

  const totalScans = filteredScans.length;
  const uniqueScans = new Set(filteredScans.map(s => `${s.operating_system}-${s.country}-${s.city}`)).size;

  // Area chart data - scans per day
  const areaData = useMemo(() => {
    const days = parseInt(period);
    const data: { date: string; scans: number; unique: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayScans = filteredScans.filter(s => format(new Date(s.scanned_at), 'yyyy-MM-dd') === dayStr);
      const uniqueSet = new Set(dayScans.map(s => `${s.operating_system}-${s.country}-${s.city}`));
      data.push({
        date: format(day, 'MMM dd'),
        scans: dayScans.length,
        unique: uniqueSet.size,
      });
    }
    return data;
  }, [filteredScans, period]);

  // Pie chart helpers
  const groupBy = (key: keyof Scan) => {
    const map: Record<string, number> = {};
    filteredScans.forEach(s => {
      const val = (s[key] as string) || 'Unknown';
      map[val] = (map[val] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  const osData = groupBy('operating_system');
  const countryData = groupBy('country');
  const cityData = groupBy('city');

  const chartConfig = {
    scans: { label: 'Scans', color: 'hsl(152, 69%, 42%)' },
    unique: { label: 'Unique Scans', color: 'hsl(210, 70%, 50%)' },
  };

  const renderDonut = (data: { name: string; value: number }[], title: string) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="w-24 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={25} outerRadius={40} dataKey="value" strokeWidth={0}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-1 text-sm flex-1 min-w-0">
          {data.map((entry, i) => {
            const pct = totalScans > 0 ? ((entry.value / totalScans) * 100).toFixed(1) : '0';
            return (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate text-foreground">{entry.name}</span>
                <span className="ml-auto text-muted-foreground">{pct}%</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedQR} onValueChange={setSelectedQR}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All QR Codes ({qrCodes.length})</SelectItem>
            {qrCodes.map(qr => (
              <SelectItem key={qr.id} value={qr.id}>{qr.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <QrCode className="w-10 h-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total QR Codes</p>
              <p className="text-3xl font-bold text-foreground">{qrCodes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary">
          <CardContent className="flex items-center gap-4 p-6">
            <ScanLine className="w-10 h-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Scans</p>
              <p className="text-3xl font-bold text-foreground">{totalScans}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Users className="w-10 h-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Unique Scans</p>
              <p className="text-3xl font-bold text-foreground">{uniqueScans}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Area chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">QR Code Scan Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="scans" stroke="hsl(152, 69%, 42%)" fill="hsl(152, 69%, 42%)" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="unique" stroke="hsl(210, 70%, 50%)" fill="hsl(210, 70%, 50%)" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Donut charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderDonut(osData, 'Scans by operating system')}
        {renderDonut(countryData, 'Scans by country')}
        {renderDonut(cityData, 'Scans by region/city')}
      </div>
    </div>
  );
}
