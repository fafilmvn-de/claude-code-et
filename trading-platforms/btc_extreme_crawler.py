#!/usr/bin/env python3
"""
EXTREME BTCUSDT Crawler - Gets ABSOLUTELY ALL DATA
No mercy, no limits - EVERYTHING from Binance API
"""

import pandas as pd
import requests
import time
from datetime import datetime, timedelta
import os
import concurrent.futures
from threading import Lock

class ExtremeBTCCrawler:
    def __init__(self):
        self.base_url = "https://api.binance.com"
        self.symbol = "BTCUSDT"
        self.interval = "1h"
        self.limit = 1000  # Max per request
        self.data_lock = Lock()
        self.all_data = []
        
    def get_server_time(self):
        """Get Binance server time"""
        try:
            response = requests.get(f"{self.base_url}/api/v3/time")
            return response.json()['serverTime'] / 1000
        except:
            return time.time()
    
    def get_earliest_timestamp(self):
        """Find the absolute earliest BTCUSDT data"""
        print("🔍 Finding ABSOLUTE earliest BTCUSDT data...")
        
        # Try multiple early dates
        test_dates = [
            datetime(2017, 8, 17),  # Binance BTCUSDT launch
            datetime(2017, 7, 14),  # Binance platform launch
            datetime(2017, 1, 1),   # Early 2017
            datetime(2016, 1, 1),   # Just in case
            datetime(2015, 1, 1),   # Even earlier
        ]
        
        earliest_found = None
        
        for test_date in test_dates:
            test_timestamp = test_date.timestamp()
            print(f"   Testing: {test_date.strftime('%Y-%m-%d')}...")
            
            data = self.get_klines(start_time=test_timestamp, limit=1)
            if data and len(data) > 0:
                earliest_found = data[0][0] / 1000
                earliest_date = datetime.fromtimestamp(earliest_found)
                print(f"   ✅ Found data from: {earliest_date}")
                break
            else:
                print(f"   ❌ No data from: {test_date}")
        
        return earliest_found
    
    def get_klines(self, start_time=None, end_time=None, limit=None):
        """Get klines with retry logic"""
        if limit is None:
            limit = self.limit
            
        endpoint = f"{self.base_url}/api/v3/klines"
        
        params = {
            'symbol': self.symbol,
            'interval': self.interval,
            'limit': limit
        }
        
        if start_time:
            params['startTime'] = int(start_time * 1000)
        if end_time:
            params['endTime'] = int(end_time * 1000)
        
        max_retries = 5
        for attempt in range(max_retries):
            try:
                response = requests.get(endpoint, params=params, timeout=30)
                if response.status_code == 429:  # Rate limit
                    wait_time = 2 ** attempt
                    print(f"   ⏳ Rate limited, waiting {wait_time}s...")
                    time.sleep(wait_time)
                    continue
                    
                response.raise_for_status()
                return response.json()
                
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"   ❌ Failed after {max_retries} attempts: {e}")
                    return None
                else:
                    wait_time = 2 ** attempt
                    print(f"   ⚠️  Attempt {attempt + 1} failed, retrying in {wait_time}s...")
                    time.sleep(wait_time)
        
        return None
    
    def crawl_chunk(self, start_time, end_time, chunk_id):
        """Crawl a specific time chunk"""
        chunk_data = []
        current_start = start_time
        
        print(f"🔥 Chunk {chunk_id}: {datetime.fromtimestamp(start_time)} to {datetime.fromtimestamp(end_time)}")
        
        while current_start < end_time:
            # Calculate this batch end time
            batch_end = min(current_start + (self.limit * 3600), end_time)
            
            data = self.get_klines(start_time=current_start, end_time=batch_end)
            
            if data and len(data) > 0:
                chunk_data.extend(data)
                print(f"   📦 Chunk {chunk_id}: +{len(data)} candles")
                
                # Move to next batch
                last_close_time = data[-1][6] / 1000
                current_start = last_close_time + 3600
            else:
                print(f"   ⚠️  Chunk {chunk_id}: No more data")
                break
            
            # Small delay to avoid hammering API
            time.sleep(0.05)
        
        return chunk_data
    
    def crawl_all_extreme(self, output_file="btcusdt_EXTREME_ALL.csv"):
        """EXTREME crawl - get absolutely everything with parallel processing"""
        
        print("🚀🚀🚀 EXTREME BTCUSDT CRAWLER - GETTING EVERYTHING! 🚀🚀🚀")
        print("=" * 80)
        
        # Get time boundaries
        start_timestamp = self.get_earliest_timestamp()
        if not start_timestamp:
            print("❌ Could not find earliest data")
            return None
            
        end_timestamp = self.get_server_time()
        
        start_date = datetime.fromtimestamp(start_timestamp)
        end_date = datetime.fromtimestamp(end_timestamp)
        
        total_hours = int((end_timestamp - start_timestamp) / 3600)
        total_days = total_hours / 24
        
        print(f"📅 Time Range: {start_date} to {end_date}")
        print(f"⏰ Total Hours: {total_hours:,}")
        print(f"📊 Total Days: {total_days:,.1f}")
        print(f"📈 Expected Records: ~{total_hours:,}")
        
        # Split into chunks for parallel processing
        chunk_size = 30 * 24 * 3600  # 30 days per chunk
        chunks = []
        
        current_time = start_timestamp
        chunk_id = 1
        
        while current_time < end_timestamp:
            chunk_end = min(current_time + chunk_size, end_timestamp)
            chunks.append((current_time, chunk_end, chunk_id))
            current_time = chunk_end
            chunk_id += 1
        
        print(f"📦 Created {len(chunks)} chunks for parallel processing")
        print("🔄 Starting parallel data extraction...")
        
        all_data = []
        
        # Process chunks in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            future_to_chunk = {
                executor.submit(self.crawl_chunk, start, end, cid): cid 
                for start, end, cid in chunks
            }
            
            for future in concurrent.futures.as_completed(future_to_chunk):
                chunk_id = future_to_chunk[future]
                try:
                    chunk_data = future.result()
                    if chunk_data:
                        all_data.extend(chunk_data)
                        print(f"✅ Chunk {chunk_id} completed: {len(chunk_data)} records")
                    else:
                        print(f"⚠️  Chunk {chunk_id} returned no data")
                except Exception as e:
                    print(f"❌ Chunk {chunk_id} failed: {e}")
        
        if not all_data:
            print("❌ No data collected!")
            return None
        
        print(f"\n🎉 EXTREME CRAWL COMPLETE!")
        print(f"📊 Total records collected: {len(all_data):,}")
        
        # Remove duplicates and sort
        print("🔧 Removing duplicates and sorting...")
        df = self.convert_to_dataframe(all_data)
        df = df.drop_duplicates(subset=['open_time']).sort_values('open_time').reset_index(drop=True)
        
        print(f"📊 Final dataset: {len(df):,} unique records")
        print(f"📅 Date range: {df['open_time'].min()} to {df['open_time'].max()}")
        
        # Save to CSV
        print(f"💾 Saving to {output_file}...")
        df.to_csv(output_file, index=False)
        
        file_size = os.path.getsize(output_file) / (1024 * 1024)
        print(f"✅ SAVED: {output_file} ({file_size:.1f} MB)")
        
        # Stats
        print(f"\n📈 EXTREME STATS:")
        print(f"   • Records: {len(df):,}")
        print(f"   • Time span: {(df['open_time'].max() - df['open_time'].min()).days:,} days")
        print(f"   • Highest price: ${df['high'].max():,.2f}")
        print(f"   • Lowest price: ${df['low'].min():,.2f}")
        print(f"   • Latest price: ${df['close'].iloc[-1]:,.2f}")
        print(f"   • Total volume: {df['volume'].sum():,.2f} BTC")
        
        print(f"\n🚀🚀🚀 EXTREME CRAWL SUCCESS - YOU HAVE EVERYTHING! 🚀🚀🚀")
        
        return df
    
    def convert_to_dataframe(self, kline_data):
        """Convert to DataFrame"""
        columns = [
            'open_time', 'open', 'high', 'low', 'close', 'volume',
            'close_time', 'quote_asset_volume', 'number_of_trades',
            'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'
        ]
        
        df = pd.DataFrame(kline_data, columns=columns)
        
        # Convert timestamps
        df['open_time'] = pd.to_datetime(df['open_time'], unit='ms')
        df['close_time'] = pd.to_datetime(df['close_time'], unit='ms')
        
        # Convert numeric columns
        price_cols = ['open', 'high', 'low', 'close', 'volume', 
                     'quote_asset_volume', 'taker_buy_base_asset_volume', 
                     'taker_buy_quote_asset_volume']
        
        for col in price_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
        df['number_of_trades'] = pd.to_numeric(df['number_of_trades'], errors='coerce')
        
        return df

def main():
    print("🔥🔥🔥 EXTREME BTCUSDT CRAWLER 🔥🔥🔥")
    print("THIS WILL GET ABSOLUTELY EVERYTHING!")
    print("=" * 60)
    
    crawler = ExtremeBTCCrawler()
    
    start_time = time.time()
    df = crawler.crawl_all_extreme()
    end_time = time.time()
    
    if df is not None:
        duration = (end_time - start_time) / 60
        print(f"\n⚡ COMPLETED IN {duration:.1f} MINUTES!")
        print(f"🎯 READY FOR EXTREME BACKTESTING!")
    else:
        print("💥 EXTREME CRAWL FAILED!")

if __name__ == "__main__":
    main()