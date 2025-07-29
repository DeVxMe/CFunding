import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  Search,
  ArrowUpCircle, 
  ArrowDownCircle, 
  History,
  ExternalLink,
  Filter
} from 'lucide-react';
import { formatSol, formatDateTime, truncateAddress } from '@/lib/solana';

export const TransactionsPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'donations' | 'withdrawals'>('all');

  // Mock data - in real app this would come from blockchain
  const transactions: any[] = [];

  if (!connected) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <History className="h-6 w-6 text-primary" />
                  Connect Wallet to View Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Connect your Solana wallet to view your transaction history.
                </p>
                <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'donations' && !tx.credited) return false;
    if (filterType === 'withdrawals' && tx.credited) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!tx.signature.toLowerCase().includes(query) &&
          !tx.cid.toString().includes(query)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Transaction History
            </h1>
            <p className="text-muted-foreground">
              Track all your donations and withdrawals on the platform.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Transactions
                  </CardTitle>
                  <History className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactions.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Donated
                  </CardTitle>
                  <ArrowUpCircle className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 SOL</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Withdrawn
                  </CardTitle>
                  <ArrowDownCircle className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 SOL</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by transaction signature or campaign ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Tabs value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="donations">Donations</TabsTrigger>
                    <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-16">
                  <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    No Transactions Found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {transactions.length === 0 
                      ? 'Start by donating to campaigns or creating your own!'
                      : 'Try adjusting your search or filters to find transactions.'
                    }
                  </p>
                  {transactions.length === 0 && (
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" onClick={() => window.location.href = '/campaigns'}>
                        Browse Campaigns
                      </Button>
                      <Button className="btn-primary-gradient" onClick={() => window.location.href = '/create'}>
                        Create Campaign
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          transaction.credited 
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {transaction.credited ? (
                            <ArrowUpCircle className="h-5 w-5" />
                          ) : (
                            <ArrowDownCircle className="h-5 w-5" />
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={transaction.credited ? 'default' : 'secondary'}>
                              {transaction.credited ? 'Donation' : 'Withdrawal'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Campaign #{transaction.cid}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(transaction.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">
                          {transaction.credited ? '+' : '-'}{formatSol(transaction.amount)}
                        </p>
                        <Button variant="ghost" size="sm" className="mt-1">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View on Explorer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};