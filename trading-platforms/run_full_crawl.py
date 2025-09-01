#!/usr/bin/env python3
"""
Run full BTCUSDT crawl without interactive prompts
"""

from btc_crawler import BTCUSDTCrawler
import time

def main():
    print("🔥 BTCUSDT Full Historical Data Crawler 🔥")
    print("=" * 60)
    
    crawler = BTCUSDTCrawler()
    
    # Run full crawl
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
        
        # Show some key statistics
        print(f"\n📈 Price Statistics:")
        print(f"   • Highest close: ${df['close'].max():,.2f}")
        print(f"   • Lowest close: ${df['close'].min():,.2f}")
        print(f"   • Latest close: ${df['close'].iloc[-1]:,.2f}")
        print(f"   • Average close: ${df['close'].mean():,.2f}")
        
    else:
        print("❌ Crawling failed")

if __name__ == "__main__":
    main()