
'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CreditCalculator() {
  const [amount, setAmount] = useState(250000);
  const [years, setYears] = useState(25);
  const [monthlyRate, setMonthlyRate] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [interestRate, setInterestRate] = useState(6.5);
  const [insuranceRate, setInsuranceRate] = useState(0.1);

  const calculate = () => {
    const months = years * 12;
    const monthlyInterest = interestRate / 100 / 12;
    const monthlyPayment =
      (amount * monthlyInterest * Math.pow(1 + monthlyInterest, months)) /
      (Math.pow(1 + monthlyInterest, months) - 1);

    let remaining = amount;
    const newSchedule = [];

    for (let i = 1; i <= months; i++) {
      const interest = remaining * monthlyInterest;
      const principal = monthlyPayment - interest;
      const insurance = remaining * (insuranceRate / 100);
      const total = monthlyPayment + insurance;

      newSchedule.push({
        month: i,
        principal: parseFloat(principal.toFixed(2)),
        interest: parseFloat(interest.toFixed(2)),
        insurance: parseFloat(insurance.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        remaining: parseFloat((remaining - principal).toFixed(2))
      });

      remaining -= principal;
    }

    setMonthlyRate((monthlyPayment + newSchedule[0].insurance).toFixed(2));
    setSchedule(newSchedule);
    setEmailSent(false);
  };

  const resetForm = () => {
    setAmount(250000);
    setYears(25);
    setMonthlyRate(null);
    setSchedule([]);
    setUserName('');
    setUserEmail('');
    setEmailSent(false);
    setInterestRate(6.5);
    setInsuranceRate(0.1);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Simulare Credit Ipotecar', 14, 20);

    const tableData = schedule.map(row => [
      row.month,
      row.principal,
      row.interest,
      row.insurance,
      row.total,
      row.remaining
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Luna', 'Principal', 'Dobandă', 'Asigurare', 'Total', 'Sold Ramas']],
      body: tableData
    });

    doc.save('simulare_credit.pdf');
  };

  const handleEmailSend = () => {
    console.log('Trimite email la:', userEmail);
    setEmailSent(true);
  };

  return (
    <div className='p-6 max-w-4xl mx-auto space-y-6'>
      <img src='/logo.png' alt='Estima Finance' className='w-48 mb-4' />
      <Card>
        <CardContent className='space-y-4 pt-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label>Suma creditului (lei)</label>
              <Input type='number' value={amount} onChange={e => setAmount(Number(e.target.value))} min={10000} step={1000} />
            </div>
            <div>
              <label>Durata (ani)</label>
              <Input type='number' value={years} onChange={e => setYears(Number(e.target.value))} min={5} max={30} />
            </div>
          </div>
          <div className='flex gap-4'>
            <Button onClick={calculate}>Calculează</Button>
            <Button onClick={resetForm} variant='secondary'>Resetare formular</Button>
          </div>
          {monthlyRate && <div className='text-xl font-semibold'>Rata lunară estimată: {monthlyRate} lei</div>}
          {schedule.length > 0 && <Button onClick={generatePDF} variant='outline'>Descarcă PDF</Button>}
        </CardContent>
      </Card>

      {schedule.length > 0 && (
        <Card>
          <CardContent className='space-y-4 pt-6'>
            <h3 className='font-bold text-lg'>Trimite simularea pe email</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label>Nume complet</label>
                <Input type='text' value={userName} onChange={e => setUserName(e.target.value)} />
              </div>
              <div>
                <label>Adresa de email</label>
                <Input type='email' value={userEmail} onChange={e => setUserEmail(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleEmailSend} disabled={!userEmail || !userName}>
              Trimite pe email
            </Button>
            {emailSent && <div className='text-green-600'>Simularea a fost trimisă cu succes!</div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
