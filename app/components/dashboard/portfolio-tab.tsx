"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Plus, Trash2, RefreshCw, ArrowUpRight, ArrowDownRight } from "lucide-react"
import Link from 'next/link';

type Asset = {
  id: string
  symbol: string
  name: string
  quantity: number
  purchasePrice: number
  currentPrice: number
  value: number
  change: number
  changePercent: number
}

type AssetAllocation = {
  name: string
  value: number
  color: string
}

type PerformanceData = {
  date: string
  value: number
}

export default function PortfolioTab() {
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: "1",
      symbol: "VTI",
      name: "Vanguard Total Stock Market ETF",
      quantity: 10,
      purchasePrice: 220.50,
      currentPrice: 245.75,
      value: 2457.50,
      change: 252.50,
      changePercent: 11.45
    },
    {
      id: "2",
      symbol: "AAPL",
      name: "Apple Inc.",
      quantity: 5,
      purchasePrice: 150.25,
      currentPrice: 175.50,
      value: 877.50,
      change: 126.25,
      changePercent: 16.80
    },
    {
      id: "3",
      symbol: "BND",
      name: "Vanguard Total Bond Market ETF",
      quantity: 15,
      purchasePrice: 80.10,
      currentPrice: 78.25,
      value: 1173.75,
      change: -27.75,
      changePercent: -2.31
    }
  ]);

  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    symbol: "",
    name: "",
    quantity: 0,
    purchasePrice: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalChange = assets.reduce((sum, asset) => sum + asset.change, 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  const assetAllocation: AssetAllocation[] = [
    { name: "Stocks", value: 60, color: "#8b5cf6" },
    { name: "Bonds", value: 30, color: "#0ea5e9" },
    { name: "Cash", value: 10, color: "#10b981" }
  ];

  const performanceData: PerformanceData[] = [
    { date: "Jan", value: 10000 },
    { date: "Feb", value: 10200 },
    { date: "Mar", value: 10150 },
    { date: "Apr", value: 10400 },
    { date: "May", value: 10600 },
    { date: "Jun", value: 10550 },
    { date: "Jul", value: 10800 },
    { date: "Aug", value: 11000 },
    { date: "Sep", value: 11200 },
    { date: "Oct", value: 11400 },
    { date: "Nov", value: 11300 },
    { date: "Dec", value: 11500 }
  ];

  const handleAddAsset = () => {
    if (!newAsset.symbol || !newAsset.name || newAsset.quantity <= 0 || newAsset.purchasePrice <= 0) {
      return;
    }

    const currentPrice = newAsset.purchasePrice * (1 + Math.random() * 0.2 - 0.1); // Simulate current price
    const value = currentPrice * newAsset.quantity;
    const change = value - (newAsset.purchasePrice * newAsset.quantity);
    const changePercent = (change / (newAsset.purchasePrice * newAsset.quantity)) * 100;

    const asset: Asset = {
      id: Date.now().toString(),
      symbol: newAsset.symbol.toUpperCase(),
      name: newAsset.name,
      quantity: newAsset.quantity,
      purchasePrice: newAsset.purchasePrice,
      currentPrice,
      value,
      change,
      changePercent
    };

    setAssets([...assets, asset]);
    setNewAsset({
      symbol: "",
      name: "",
      quantity: 0,
      purchasePrice: 0
    });
    setIsAddAssetOpen(false);
  };

  const handleRemoveAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const handleRefreshPrices = () => {
    setIsRefreshing(true);

    // Simulate API call to refresh prices
    setTimeout(() => {
      const updatedAssets = assets.map(asset => {
        const randomChange = Math.random() * 0.05 - 0.025; // Random change between -2.5% and +2.5%
        const newPrice = asset.currentPrice * (1 + randomChange);
        const newValue = newPrice * asset.quantity;
        const newChange = newValue - (asset.purchasePrice * asset.quantity);
        const newChangePercent = (newChange / (asset.purchasePrice * asset.quantity)) * 100;

        return {
          ...asset,
          currentPrice: newPrice,
          value: newValue,
          change: newChange,
          changePercent: newChangePercent
        };
      });

      setAssets(updatedAssets);
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">${totalValue.toFixed(2)}</span>
              <div className={`ml-2 flex items-center ${totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalChangePercent >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span>{totalChangePercent.toFixed(2)}%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {totalChange >= 0 ? "+" : ""}{totalChange.toFixed(2)} overall
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Asset Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{assets.length}</span>
              <span className="ml-2 text-sm text-muted-foreground">investments</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Across various asset classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">AI Suggestion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Your portfolio is heavily weighted in stocks. Consider adding bonds for better diversification.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Your Assets</CardTitle>
              <CardDescription>
                Track your investments and their performance
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleRefreshPrices} disabled={isRefreshing}>
                {isRefreshing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Refresh</span>
              </Button>
              <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Asset</DialogTitle>
                    <DialogDescription>
                      Enter the details of the investment you want to add to your portfolio.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="symbol" className="text-right">
                        Symbol
                      </Label>
                      <Input
                        id="symbol"
                        placeholder="AAPL"
                        className="col-span-3"
                        value={newAsset.symbol}
                        onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Apple Inc."
                        className="col-span-3"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="10"
                        className="col-span-3"
                        value={newAsset.quantity || ""}
                        onChange={(e) => setNewAsset({ ...newAsset, quantity: Number.parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Purchase Price
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="150.00"
                        className="col-span-3"
                        value={newAsset.purchasePrice || ""}
                        onChange={(e) => setNewAsset({ ...newAsset, purchasePrice: Number.parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddAssetOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddAsset}>Add Asset</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left font-medium">Symbol</th>
                      <th className="h-10 px-4 text-left font-medium">Name</th>
                      <th className="h-10 px-4 text-right font-medium">Quantity</th>
                      <th className="h-10 px-4 text-right font-medium">Price</th>
                      <th className="h-10 px-4 text-right font-medium">Value</th>
                      <th className="h-10 px-4 text-right font-medium">Change</th>
                      <th className="h-10 px-4 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => (
                      <tr key={asset.id} className="border-b">
                        <td className="p-4 font-medium">
                          <Link href={`/stock/${asset.symbol}`} className="hover:underline">
                            {asset.symbol}
                          </Link>
                        </td>
                        <td className="p-4">{asset.name}</td>
                        <td className="p-4 text-right">{asset.quantity}</td>
                        <td className="p-4 text-right">${asset.currentPrice.toFixed(2)}</td>
                        <td className="p-4 text-right">${asset.value.toFixed(2)}</td>
                        <td className={`p-4 text-right ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <div className="flex items-center justify-end">
                            {asset.changePercent >= 0 ? (
                              <ArrowUpRight className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 mr-1" />
                            )}
                            {asset.changePercent.toFixed(2)}%
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveAsset(asset.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {assets.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-muted-foreground">
                          No assets in your portfolio. Add your first investment!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>
              How your investments are distributed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>
            Track how your investments have performed over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="1y">
            <TabsList className="mb-4">
              <TabsTrigger value="1m">1M</TabsTrigger>
              <TabsTrigger value="3m">3M</TabsTrigger>
              <TabsTrigger value="6m">6M</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="1m">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="3m"></TabsContent>
            <TabsContent value="6m"></TabsContent>
            <TabsContent value="1y"></TabsContent>
            <TabsContent value="all"></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

