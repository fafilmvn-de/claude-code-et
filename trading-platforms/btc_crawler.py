#!/usr/bin/env python3
"""
BTCUSDT Hourly Price Crawler for Backtesting
Fetches ALL historical hourly close prices from Binance API and saves to CSV
"""

import pandas as pd
import requests
import time
from datetime import datetime, timedelta
import os

class BTCUSDTCrawler:
    def __init__(self):
        self.base_url = "https://api.binance.com"
        self.symbol = "BTCUSDT"
        self.interval = "1h"  # Hourly data
        self.limit = 1000  # Max limit per request
        
    def get_klines(self, start_time=None, end_time=None):
        """
        Get kline/candlestick data from Binance API
        """
        endpoint = f"{self.base_url}/api/v3/klines"
        
        params = {
            'symbol': self.symbol,
            'interval': self.interval,
            'limit': self.limit
        }
        
        if start_time:
            params['startTime'] = int(start_time * 1000)  # Convert to milliseconds
        if end_time:
            params['endTime'] = int(end_time * 1000)
            
        try:
            response = requests.get(endpoint, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data: {e}")
            return None
    
    def get_earliest_valid_timestamp(self):
        """
        Get the earliest available timestamp for BTCUSDT
        """
        try:
            # Start from a very early date (Bitcoin trading began around 2010)
            # But Binance started in 2017, so we'll start from 2017
            earliest_date = datetime(2017, 7, 1)  # Binance launch date
            start_timestamp = earliest_date.timestamp()
            
            # Get first available data
            data = self.get_klines(start_time=start_timestamp)
            if data and len(data) > 0:
                # Return the timestamp of the first available candle
                return data[0][0] / 1000  # Convert from milliseconds to seconds
            else:
                print("No data available from the earliest date")
                return None
                
        except Exception as e:
            print(f"Error getting earliest timestamp: {e}")
            return None
    
    def crawl_all_data(self, output_file="btcusdt_hourly_all.csv"):
        """
        Crawl ALL historical hourly BTCUSDT data and save to CSV
        """
        print(f"🚀 Starting to crawl ALL BTCUSDT hourly data...")
        print(f"📊 Symbol: {self.symbol}")
        print(f"⏰ Interval: {self.interval}")
        print(f"💾 Output file: {output_file}")
        
        # Get earliest available timestamp
        print("\n🔍 Finding earliest available data...")
        start_timestamp = self.get_earliest_valid_timestamp()
        
        if not start_timestamp:
            print("❌ Could not determine earliest timestamp")
            return
            
        start_date = datetime.fromtimestamp(start_timestamp)
        print(f"📅 Earliest data available from: {start_date}")
        
        # End timestamp is current time
        end_timestamp = datetime.now().timestamp()
        end_date = datetime.fromtimestamp(end_timestamp)
        print(f"📅 Crawling until: {end_date}")
        
        all_data = []
        current_start = start_timestamp
        batch_count = 0
        
        print(f"\n📥 Starting data collection...")
        
        while current_start < end_timestamp:
            batch_count += 1
            
            # Calculate end time for this batch (1000 hours = ~41.67 days)
            batch_end = current_start + (self.limit * 3600)  # 3600 seconds per hour
            if batch_end > end_timestamp:
                batch_end = end_timestamp
                
            print(f"📦 Batch {batch_count}: {datetime.fromtimestamp(current_start).strftime('%Y-%m-%d %H:%M')} to {datetime.fromtimestamp(batch_end).strftime('%Y-%m-%d %H:%M')}")
            
            # Get data for this batch
            data = self.get_klines(start_time=current_start, end_time=batch_end)
            
            if data:
                print(f"   ✅ Received {len(data)} candles")
                all_data.extend(data)
                
                # Update start time to the last candle's close time + 1 hour
                if data:
                    last_close_time = data[-1][6] / 1000  # Close time in seconds
                    current_start = last_close_time + 3600  # Add 1 hour
                else:
                    break
            else:
                print(f"   ❌ No data received for this batch")
                break
                
            # Rate limiting - be nice to the API
            time.sleep(0.1)
            
            # Progress update every 50 batches
            if batch_count % 50 == 0:
                total_hours = len(all_data)
                total_days = total_hours / 24
                print(f"📈 Progress: {total_hours:,} hours ({total_days:.1f} days) collected so far...")
        
        if not all_data:
            print("❌ No data collected")
            return
            
        print(f"\n🎉 Data collection complete!")
        print(f"📊 Total candles collected: {len(all_data):,}")
        print(f"📅 Time range: {datetime.fromtimestamp(all_data[0][0]/1000)} to {datetime.fromtimestamp(all_data[-1][6]/1000)}")
        
        # Convert to DataFrame
        print(f"\n📝 Converting to DataFrame...")
        df = self.convert_to_dataframe(all_data)
        
        # Save to CSV
        print(f"💾 Saving to {output_file}...")
        df.to_csv(output_file, index=False)
        
        # File size
        file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
        print(f"✅ Successfully saved {len(df):,} records to {output_file}")
        print(f"📁 File size: {file_size:.1f} MB")
        
        # Display sample data
        print(f"\n📋 Sample data (first 5 rows):")
        print(df.head())
        
        print(f"\n📋 Sample data (last 5 rows):")
        print(df.tail())
        
        return df
    
    def convert_to_dataframe(self, kline_data):
        """
        Convert kline data to pandas DataFrame
        """
        columns = [
            'open_time', 'open', 'high', 'low', 'close', 'volume',
            'close_time', 'quote_asset_volume', 'number_of_trades',
            'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'
        ]
        
        df = pd.DataFrame(kline_data, columns=columns)
        
        # Convert timestamps to datetime
        df['open_time'] = pd.to_datetime(df['open_time'], unit='ms')
        df['close_time'] = pd.to_datetime(df['close_time'], unit='ms')
        
        # Convert price and volume columns to float
        price_volume_cols = ['open', 'high', 'low', 'close', 'volume', 
                           'quote_asset_volume', 'taker_buy_base_asset_volume', 
                           'taker_buy_quote_asset_volume']
        
        for col in price_volume_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
        df['number_of_trades'] = pd.to_numeric(df['number_of_trades'], errors='coerce')
        
        # Sort by open_time to ensure chronological order
        df = df.sort_values('open_time').reset_index(drop=True)
        
        return df
    
    def get_sample_data(self, hours=24):
        """
        Get sample data for testing (last N hours)
        """
        print(f"📊 Getting sample data (last {hours} hours)...")
        
        # Get recent data
        data = self.get_klines()
        
        if data:
            # Take last N records
            sample_data = data[-hours:] if len(data) >= hours else data
            df = self.convert_to_dataframe(sample_data)
            
            print(f"✅ Got {len(df)} hours of recent data")
            print(f"📅 From: {df['open_time'].min()} to {df['open_time'].max()}")
            
            return df
        else:
            print("❌ Could not get sample data")
            return None

def main():
    """
    Main function to run the crawler
    """
    crawler = BTCUSDTCrawler()
    
    print("🔥 BTCUSDT Hourly Data Crawler for Backtesting 🔥")
    print("=" * 60)
    
    # Option to get sample data first (for testing)
    test_mode = input("Do you want to test with sample data first? (y/n): ").lower().strip()
    
    if test_mode == 'y':
        print("\n🧪 Testing with sample data...")
        sample_df = crawler.get_sample_data(hours=48)  # Last 48 hours
        
        if sample_df is not None:
            sample_file = "btcusdt_sample.csv"
            sample_df.to_csv(sample_file, index=False)
            print(f"💾 Sample data saved to {sample_file}")
            print("\nSample data:")
            print(sample_df[['open_time', 'close']].head(10))
        
        proceed = input("\nProceed with full data crawl? (y/n): ").lower().strip()
        if proceed != 'y':
            print("👋 Exiting...")
            return
    
    # Full data crawl
    print("\n🚀 Starting full historical data crawl...")
    output_file = input("Enter output filename (default: btcusdt_hourly_all.csv): ").strip()
    if not output_file:
        output_file = "btcusdt_hourly_all.csv"
    
    start_time = time.time()
    df = crawler.crawl_all_data(output_file)
    end_time = time.time()
    
    if df is not None:
        duration = end_time - start_time
        print(f"\n🎉 Crawling completed in {duration:.1f} seconds!")
        print(f"📊 Dataset summary:")
        print(f"   • Records: {len(df):,}")
        print(f"   • Time span: {(df['open_time'].max() - df['open_time'].min()).days} days")
        print(f"   • File: {output_file}")
        print(f"\n🎯 Ready for backtesting! 🚀")
    else:
        print("❌ Crawling failed")

if __name__ == "__main__":
    main()