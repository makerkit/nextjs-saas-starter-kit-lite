'use client';

import { useMemo, useState } from 'react';

import { ArrowDown, ArrowUp, Menu, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from 'recharts';

import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@kit/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

export default function DashboardDemo() {
  const mrr = useMemo(() => generateDemoData(), []);
  const netRevenue = useMemo(() => generateDemoData(), []);
  const fees = useMemo(() => generateDemoData(), []);
  const newCustomers = useMemo(() => generateDemoData(), []);

  return (
    <div
      className={
        'animate-in fade-in flex flex-col space-y-4 pb-36 duration-500'
      }
    >
      <div
        className={
          'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
        }
      >
        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2.5'}>
              <span>MRR</span>
              <Trend trend={'up'}>20%</Trend>
            </CardTitle>

            <CardDescription>
              <span>Monthly recurring revenue</span>
            </CardDescription>

            <div>
              <Figure>{`$${mrr[1]}`}</Figure>
            </div>
          </CardHeader>

          <CardContent className={'space-y-4'}>
            <Chart data={mrr[0]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2.5'}>
              <span>Revenue</span>
              <Trend trend={'up'}>12%</Trend>
            </CardTitle>

            <CardDescription>
              <span>Total revenue including fees</span>
            </CardDescription>

            <div>
              <Figure>{`$${netRevenue[1]}`}</Figure>
            </div>
          </CardHeader>

          <CardContent>
            <Chart data={netRevenue[0]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2.5'}>
              <span>Fees</span>
              <Trend trend={'up'}>9%</Trend>
            </CardTitle>

            <CardDescription>
              <span>Total fees collected</span>
            </CardDescription>

            <div>
              <Figure>{`$${fees[1]}`}</Figure>
            </div>
          </CardHeader>

          <CardContent>
            <Chart data={fees[0]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2.5'}>
              <span>New Customers</span>
              <Trend trend={'down'}>-25%</Trend>
            </CardTitle>

            <CardDescription>
              <span>Customers who signed up this month</span>
            </CardDescription>

            <div>
              <Figure>{`${Number(newCustomers[1]).toFixed(0)}`}</Figure>
            </div>
          </CardHeader>

          <CardContent>
            <Chart data={newCustomers[0]} />
          </CardContent>
        </Card>
      </div>

      <VisitorsChart />

      <PageViewsChart />

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Best Customers</CardTitle>
            <CardDescription>Showing the top customers by MRR</CardDescription>
          </CardHeader>

          <CardContent>
            <CustomersTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function generateDemoData() {
  const today = new Date();
  const formatter = new Intl.DateTimeFormat('en-us', {
    month: 'long',
    year: '2-digit',
  });

  const data: { value: string; name: string }[] = [];

  for (let n = 8; n > 0; n -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - n, 1);

    data.push({
      name: formatter.format(date),
      value: (Math.random() * 10).toFixed(1),
    });
  }

  const lastValue = data[data.length - 1]?.value;

  return [data, lastValue] as [typeof data, string];
}

function Chart(
  props: React.PropsWithChildren<{ data: { value: string; name: string }[] }>,
) {
  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: 'var(--chart-1)',
    },
    mobile: {
      label: 'Mobile',
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig}>
      <LineChart accessibilityLayer data={props.data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Line
          dataKey="value"
          type="natural"
          stroke="var(--color-desktop)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

function CustomersTable() {
  const customers = [
    {
      name: 'John Doe',
      email: 'john@makerkit.dev',
      plan: 'Pro',
      mrr: '$120.5',
      logins: 1020,
      status: 'Healthy',
      trend: 'up',
    },
    {
      name: 'Emma Smith',
      email: 'emma@makerit.dev',
      plan: 'Basic',
      mrr: '$65.4',
      logins: 570,
      status: 'Possible Churn',
      trend: 'stale',
    },
    {
      name: 'Robert Johnson',
      email: 'robert@makerkit.dev',
      plan: 'Pro',
      mrr: '$500.1',
      logins: 2050,
      status: 'Healthy',
      trend: 'up',
    },
    {
      name: 'Olivia Brown',
      email: 'olivia@makerkit.dev',
      plan: 'Basic',
      mrr: '$10',
      logins: 50,
      status: 'Churn',
      trend: 'down',
    },
    {
      name: 'Michael Davis',
      email: 'michael@makerkit.dev',
      plan: 'Pro',
      mrr: '$300.2',
      logins: 1520,
      status: 'Healthy',
      trend: 'up',
    },
    {
      name: 'Emily Jones',
      email: 'emily@makerkit.dev',
      plan: 'Pro',
      mrr: '$75.7',
      logins: 780,
      status: 'Healthy',
      trend: 'up',
    },
    {
      name: 'Daniel Garcia',
      email: 'daniel@makerkit.dev',
      plan: 'Basic',
      mrr: '$50',
      logins: 320,
      status: 'Possible Churn',
      trend: 'stale',
    },
    {
      name: 'Liam Miller',
      email: 'liam@makerkit.dev',
      plan: 'Pro',
      mrr: '$90.8',
      logins: 1260,
      status: 'Healthy',
      trend: 'up',
    },
    {
      name: 'Emma Clark',
      email: 'emma@makerkit.dev',
      plan: 'Basic',
      mrr: '$0',
      logins: 20,
      status: 'Churn',
      trend: 'down',
    },
    {
      name: 'Elizabeth Rodriguez',
      email: 'liz@makerkit.dev',
      plan: 'Pro',
      mrr: '$145.3',
      logins: 1380,
      status: 'Healthy',
      trend: 'up',
    },
    {
      name: 'James Martinez',
      email: 'james@makerkit.dev',
      plan: 'Pro',
      mrr: '$120.5',
      logins: 940,
      status: 'Healthy',
      trend: 'up',
    },
    {
      name: 'Charlotte Ryan',
      email: 'carlotte@makerkit.dev',
      plan: 'Basic',
      mrr: '$80.6',
      logins: 460,
      status: 'Possible Churn',
      trend: 'stale',
    },
    {
      name: 'Lucas Evans',
      email: 'lucas@makerkit.dev',
      plan: 'Pro',
      mrr: '$210.3',
      logins: 1850,
      status: 'Healthy',
      trend: 'up',
    },
    {
      name: 'Sophia Wilson',
      email: 'sophia@makerkit.dev',
      plan: 'Basic',
      mrr: '$10',
      logins: 35,
      status: 'Churn',
      trend: 'down',
    },
    {
      name: 'William Kelly',
      email: 'will@makerkit.dev',
      plan: 'Pro',
      mrr: '$350.2',
      logins: 1760,
      status: 'Healthy',
      trend: 'up',
    },
    {
      name: 'Oliver Thomas',
      email: 'olly@makerkit.dev',
      plan: 'Pro',
      mrr: '$145.6',
      logins: 1350,
      status: 'Healthy',
      trend: 'up',
    },
    {
      name: 'Samantha White',
      email: 'sam@makerkit.dev',
      plan: 'Basic',
      mrr: '$60.3',
      logins: 425,
      status: 'Possible Churn',
      trend: 'stale',
    },
    {
      name: 'Benjamin Lewis',
      email: 'ben@makerkit.dev',
      plan: 'Pro',
      mrr: '$175.8',
      logins: 1600,
      status: 'Healthy',
      trend: 'up',
    },
    {
      name: 'Zoe Harris',
      email: 'zoe@makerkit.dev',
      plan: 'Basic',
      mrr: '$0',
      logins: 18,
      status: 'Churn',
      trend: 'down',
    },
    {
      name: 'Zachary Nelson',
      email: 'zac@makerkit.dev',
      plan: 'Pro',
      mrr: '$255.9',
      logins: 1785,
      status: 'Healthy',
      trend: 'up',
    },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>MRR</TableHead>
          <TableHead>Logins</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.name}>
            <TableCell className={'flex flex-col'}>
              <span>{customer.name}</span>
              <span className={'text-muted-foreground text-sm'}>
                {customer.email}
              </span>
            </TableCell>
            <TableCell>{customer.plan}</TableCell>
            <TableCell>{customer.mrr}</TableCell>
            <TableCell>{customer.logins}</TableCell>
            <TableCell>
              <BadgeWithTrend trend={customer.trend}>
                {customer.status}
              </BadgeWithTrend>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BadgeWithTrend(props: React.PropsWithChildren<{ trend: string }>) {
  const className = useMemo(() => {
    switch (props.trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-destructive';
      case 'stale':
        return 'text-orange-500';
    }
  }, [props.trend]);

  return (
    <Badge
      variant={'outline'}
      className={'border-transparent px-1.5 font-normal'}
    >
      <span className={className}>{props.children}</span>
    </Badge>
  );
}

function Figure(props: React.PropsWithChildren) {
  return (
    <div className={'font-heading text-2xl font-semibold'}>
      {props.children}
    </div>
  );
}

function Trend(
  props: React.PropsWithChildren<{
    trend: 'up' | 'down' | 'stale';
  }>,
) {
  const Icon = useMemo(() => {
    switch (props.trend) {
      case 'up':
        return <ArrowUp className={'h-3 w-3 text-green-500'} />;
      case 'down':
        return <ArrowDown className={'text-destructive h-3 w-3'} />;
      case 'stale':
        return <Menu className={'h-3 w-3 text-orange-500'} />;
    }
  }, [props.trend]);

  return (
    <div>
      <BadgeWithTrend trend={props.trend}>
        <span className={'flex items-center space-x-1'}>
          {Icon}
          <span>{props.children}</span>
        </span>
      </BadgeWithTrend>
    </div>
  );
}

export function VisitorsChart() {
  const chartData = useMemo(
    () => [
      { date: '2024-04-01', desktop: 222, mobile: 150 },
      { date: '2024-04-02', desktop: 97, mobile: 180 },
      { date: '2024-04-03', desktop: 167, mobile: 120 },
      { date: '2024-04-04', desktop: 242, mobile: 260 },
      { date: '2024-04-05', desktop: 373, mobile: 290 },
      { date: '2024-04-06', desktop: 301, mobile: 340 },
      { date: '2024-04-07', desktop: 245, mobile: 180 },
      { date: '2024-04-08', desktop: 409, mobile: 320 },
      { date: '2024-04-09', desktop: 59, mobile: 110 },
      { date: '2024-04-10', desktop: 261, mobile: 190 },
      { date: '2024-04-11', desktop: 327, mobile: 350 },
      { date: '2024-04-12', desktop: 292, mobile: 210 },
      { date: '2024-04-13', desktop: 342, mobile: 380 },
      { date: '2024-04-14', desktop: 137, mobile: 220 },
      { date: '2024-04-15', desktop: 120, mobile: 170 },
      { date: '2024-04-16', desktop: 138, mobile: 190 },
      { date: '2024-04-17', desktop: 446, mobile: 360 },
      { date: '2024-04-18', desktop: 364, mobile: 410 },
      { date: '2024-04-19', desktop: 243, mobile: 180 },
      { date: '2024-04-20', desktop: 89, mobile: 150 },
      { date: '2024-04-21', desktop: 137, mobile: 200 },
      { date: '2024-04-22', desktop: 224, mobile: 170 },
      { date: '2024-04-23', desktop: 138, mobile: 230 },
      { date: '2024-04-24', desktop: 387, mobile: 290 },
      { date: '2024-04-25', desktop: 215, mobile: 250 },
      { date: '2024-04-26', desktop: 75, mobile: 130 },
      { date: '2024-04-27', desktop: 383, mobile: 420 },
      { date: '2024-04-28', desktop: 122, mobile: 180 },
      { date: '2024-04-29', desktop: 315, mobile: 240 },
      { date: '2024-04-30', desktop: 454, mobile: 380 },
      { date: '2024-05-01', desktop: 165, mobile: 220 },
      { date: '2024-05-02', desktop: 293, mobile: 310 },
      { date: '2024-05-03', desktop: 247, mobile: 190 },
      { date: '2024-05-04', desktop: 385, mobile: 420 },
      { date: '2024-05-05', desktop: 481, mobile: 390 },
      { date: '2024-05-06', desktop: 498, mobile: 520 },
      { date: '2024-05-07', desktop: 388, mobile: 300 },
      { date: '2024-05-08', desktop: 149, mobile: 210 },
      { date: '2024-05-09', desktop: 227, mobile: 180 },
      { date: '2024-05-10', desktop: 293, mobile: 330 },
      { date: '2024-05-11', desktop: 335, mobile: 270 },
      { date: '2024-05-12', desktop: 197, mobile: 240 },
      { date: '2024-05-13', desktop: 197, mobile: 160 },
      { date: '2024-05-14', desktop: 448, mobile: 490 },
      { date: '2024-05-15', desktop: 473, mobile: 380 },
      { date: '2024-05-16', desktop: 338, mobile: 400 },
      { date: '2024-05-17', desktop: 499, mobile: 420 },
      { date: '2024-05-18', desktop: 315, mobile: 350 },
      { date: '2024-05-19', desktop: 235, mobile: 180 },
      { date: '2024-05-20', desktop: 177, mobile: 230 },
      { date: '2024-05-21', desktop: 82, mobile: 140 },
      { date: '2024-05-22', desktop: 81, mobile: 120 },
      { date: '2024-05-23', desktop: 252, mobile: 290 },
      { date: '2024-05-24', desktop: 294, mobile: 220 },
      { date: '2024-05-25', desktop: 201, mobile: 250 },
      { date: '2024-05-26', desktop: 213, mobile: 170 },
      { date: '2024-05-27', desktop: 420, mobile: 460 },
      { date: '2024-05-28', desktop: 233, mobile: 190 },
      { date: '2024-05-29', desktop: 78, mobile: 130 },
      { date: '2024-05-30', desktop: 340, mobile: 280 },
      { date: '2024-05-31', desktop: 178, mobile: 230 },
      { date: '2024-06-01', desktop: 178, mobile: 200 },
      { date: '2024-06-02', desktop: 470, mobile: 410 },
      { date: '2024-06-03', desktop: 103, mobile: 160 },
      { date: '2024-06-04', desktop: 439, mobile: 380 },
      { date: '2024-06-05', desktop: 88, mobile: 140 },
      { date: '2024-06-06', desktop: 294, mobile: 250 },
      { date: '2024-06-07', desktop: 323, mobile: 370 },
      { date: '2024-06-08', desktop: 385, mobile: 320 },
      { date: '2024-06-09', desktop: 438, mobile: 480 },
      { date: '2024-06-10', desktop: 155, mobile: 200 },
      { date: '2024-06-11', desktop: 92, mobile: 150 },
      { date: '2024-06-12', desktop: 492, mobile: 420 },
      { date: '2024-06-13', desktop: 81, mobile: 130 },
      { date: '2024-06-14', desktop: 426, mobile: 380 },
      { date: '2024-06-15', desktop: 307, mobile: 350 },
      { date: '2024-06-16', desktop: 371, mobile: 310 },
      { date: '2024-06-17', desktop: 475, mobile: 520 },
      { date: '2024-06-18', desktop: 107, mobile: 170 },
      { date: '2024-06-19', desktop: 341, mobile: 290 },
      { date: '2024-06-20', desktop: 408, mobile: 450 },
      { date: '2024-06-21', desktop: 169, mobile: 210 },
      { date: '2024-06-22', desktop: 317, mobile: 270 },
      { date: '2024-06-23', desktop: 480, mobile: 530 },
      { date: '2024-06-24', desktop: 132, mobile: 180 },
      { date: '2024-06-25', desktop: 141, mobile: 190 },
      { date: '2024-06-26', desktop: 434, mobile: 380 },
      { date: '2024-06-27', desktop: 448, mobile: 490 },
      { date: '2024-06-28', desktop: 149, mobile: 200 },
      { date: '2024-06-29', desktop: 103, mobile: 160 },
      { date: '2024-06-30', desktop: 446, mobile: 400 },
    ],
    [],
  );

  const chartConfig = {
    visitors: {
      label: 'Visitors',
    },
    desktop: {
      label: 'Desktop',
      color: 'var(--chart-1)',
    },
    mobile: {
      label: 'Mobile',
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitors</CardTitle>
        <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer className={'h-64 w-full'} config={chartConfig}>
          <AreaChart accessibilityLayer data={chartData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export function PageViewsChart() {
  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>('desktop');

  const chartData = [
    { date: '2024-04-01', desktop: 222, mobile: 150 },
    { date: '2024-04-02', desktop: 97, mobile: 180 },
    { date: '2024-04-03', desktop: 167, mobile: 120 },
    { date: '2024-04-04', desktop: 242, mobile: 260 },
    { date: '2024-04-05', desktop: 373, mobile: 290 },
    { date: '2024-04-06', desktop: 301, mobile: 340 },
    { date: '2024-04-07', desktop: 245, mobile: 180 },
    { date: '2024-04-08', desktop: 409, mobile: 320 },
    { date: '2024-04-09', desktop: 59, mobile: 110 },
    { date: '2024-04-10', desktop: 261, mobile: 190 },
    { date: '2024-04-11', desktop: 327, mobile: 350 },
    { date: '2024-04-12', desktop: 292, mobile: 210 },
    { date: '2024-04-13', desktop: 342, mobile: 380 },
    { date: '2024-04-14', desktop: 137, mobile: 220 },
    { date: '2024-04-15', desktop: 120, mobile: 170 },
    { date: '2024-04-16', desktop: 138, mobile: 190 },
    { date: '2024-04-17', desktop: 446, mobile: 360 },
    { date: '2024-04-18', desktop: 364, mobile: 410 },
    { date: '2024-04-19', desktop: 243, mobile: 180 },
    { date: '2024-04-20', desktop: 89, mobile: 150 },
    { date: '2024-04-21', desktop: 137, mobile: 200 },
    { date: '2024-04-22', desktop: 224, mobile: 170 },
    { date: '2024-04-23', desktop: 138, mobile: 230 },
    { date: '2024-04-24', desktop: 387, mobile: 290 },
    { date: '2024-04-25', desktop: 215, mobile: 250 },
    { date: '2024-04-26', desktop: 75, mobile: 130 },
    { date: '2024-04-27', desktop: 383, mobile: 420 },
    { date: '2024-04-28', desktop: 122, mobile: 180 },
    { date: '2024-04-29', desktop: 315, mobile: 240 },
    { date: '2024-04-30', desktop: 454, mobile: 380 },
    { date: '2024-05-01', desktop: 165, mobile: 220 },
    { date: '2024-05-02', desktop: 293, mobile: 310 },
    { date: '2024-05-03', desktop: 247, mobile: 190 },
    { date: '2024-05-04', desktop: 385, mobile: 420 },
    { date: '2024-05-05', desktop: 481, mobile: 390 },
    { date: '2024-05-06', desktop: 498, mobile: 520 },
    { date: '2024-05-07', desktop: 388, mobile: 300 },
    { date: '2024-05-08', desktop: 149, mobile: 210 },
    { date: '2024-05-09', desktop: 227, mobile: 180 },
    { date: '2024-05-10', desktop: 293, mobile: 330 },
    { date: '2024-05-11', desktop: 335, mobile: 270 },
    { date: '2024-05-12', desktop: 197, mobile: 240 },
    { date: '2024-05-13', desktop: 197, mobile: 160 },
    { date: '2024-05-14', desktop: 448, mobile: 490 },
    { date: '2024-05-15', desktop: 473, mobile: 380 },
    { date: '2024-05-16', desktop: 338, mobile: 400 },
    { date: '2024-05-17', desktop: 499, mobile: 420 },
    { date: '2024-05-18', desktop: 315, mobile: 350 },
    { date: '2024-05-19', desktop: 235, mobile: 180 },
    { date: '2024-05-20', desktop: 177, mobile: 230 },
    { date: '2024-05-21', desktop: 82, mobile: 140 },
    { date: '2024-05-22', desktop: 81, mobile: 120 },
    { date: '2024-05-23', desktop: 252, mobile: 290 },
    { date: '2024-05-24', desktop: 294, mobile: 220 },
    { date: '2024-05-25', desktop: 201, mobile: 250 },
    { date: '2024-05-26', desktop: 213, mobile: 170 },
    { date: '2024-05-27', desktop: 420, mobile: 460 },
    { date: '2024-05-28', desktop: 233, mobile: 190 },
    { date: '2024-05-29', desktop: 78, mobile: 130 },
    { date: '2024-05-30', desktop: 340, mobile: 280 },
    { date: '2024-05-31', desktop: 178, mobile: 230 },
    { date: '2024-06-01', desktop: 178, mobile: 200 },
    { date: '2024-06-02', desktop: 470, mobile: 410 },
    { date: '2024-06-03', desktop: 103, mobile: 160 },
    { date: '2024-06-04', desktop: 439, mobile: 380 },
    { date: '2024-06-05', desktop: 88, mobile: 140 },
    { date: '2024-06-06', desktop: 294, mobile: 250 },
    { date: '2024-06-07', desktop: 323, mobile: 370 },
    { date: '2024-06-08', desktop: 385, mobile: 320 },
    { date: '2024-06-09', desktop: 438, mobile: 480 },
    { date: '2024-06-10', desktop: 155, mobile: 200 },
    { date: '2024-06-11', desktop: 92, mobile: 150 },
    { date: '2024-06-12', desktop: 492, mobile: 420 },
    { date: '2024-06-13', desktop: 81, mobile: 130 },
    { date: '2024-06-14', desktop: 426, mobile: 380 },
    { date: '2024-06-15', desktop: 307, mobile: 350 },
    { date: '2024-06-16', desktop: 371, mobile: 310 },
    { date: '2024-06-17', desktop: 475, mobile: 520 },
    { date: '2024-06-18', desktop: 107, mobile: 170 },
    { date: '2024-06-19', desktop: 341, mobile: 290 },
    { date: '2024-06-20', desktop: 408, mobile: 450 },
    { date: '2024-06-21', desktop: 169, mobile: 210 },
    { date: '2024-06-22', desktop: 317, mobile: 270 },
    { date: '2024-06-23', desktop: 480, mobile: 530 },
    { date: '2024-06-24', desktop: 132, mobile: 180 },
    { date: '2024-06-25', desktop: 141, mobile: 190 },
    { date: '2024-06-26', desktop: 434, mobile: 380 },
    { date: '2024-06-27', desktop: 448, mobile: 490 },
    { date: '2024-06-28', desktop: 149, mobile: 200 },
    { date: '2024-06-29', desktop: 103, mobile: 160 },
    { date: '2024-06-30', desktop: 446, mobile: 400 },
  ];

  const chartConfig = {
    views: {
      label: 'Page Views',
    },
    desktop: {
      label: 'Desktop',
      color: 'var(--chart-1)',
    },
    mobile: {
      label: 'Mobile',
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig;

  const total = useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    [],
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Page Views</CardTitle>

          <CardDescription>
            Showing total visitors for the last 3 months
          </CardDescription>
        </div>

        <div className="flex">
          {['desktop', 'mobile'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full"
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    // recharts 3 types this as ReactNode; the data is keyed on
                    // date strings
                    return new Date(value as string).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      },
                    );
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
