import { useCurrency, CURRENCIES, Currency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Coins } from 'lucide-react';

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  const currentCurrency = CURRENCIES.find(c => c.code === currency);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Change currency"
        >
          <Coins className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        {CURRENCIES.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => setCurrency(curr.code)}
            className={currency === curr.code ? 'bg-accent' : ''}
          >
            <span className="mr-2 font-medium">{curr.symbol}</span>
            {curr.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
