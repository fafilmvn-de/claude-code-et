#!/usr/bin/env python3
"""
Simple script to get FPT stock price from public APIs
"""

import requests
import json
from datetime import datetime

def get_fpt_price_yahoo():
    """Get FPT price from Yahoo Finance"""
    try:
        # Yahoo Finance API for FPT.VN
        url = "https://query1.finance.yahoo.com/v8/finance/chart/FPT.VN"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'chart' in data and data['chart']['result']:
                result = data['chart']['result'][0]
                meta = result['meta']
                
                current_price = meta.get('regularMarketPrice')
                previous_close = meta.get('previousClose')
                
                print(f"=== FPT Corporation (FPT.VN) Latest Price ===")
                print(f"Current Price: {current_price:,.0f} VND")
                print(f"Previous Close: {previous_close:,.0f} VND")
                
                if current_price and previous_close:
                    change = current_price - previous_close
                    change_percent = (change / previous_close) * 100
                    print(f"Change: {change:+.0f} VND ({change_percent:+.2f}%)")
                
                print(f"Currency: {meta.get('currency', 'VND')}")
                print(f"Exchange: {meta.get('exchangeName', 'HOSE')}")
                
                return current_price
        else:
            print(f"Failed to fetch data from Yahoo Finance: {response.status_code}")
            
    except Exception as e:
        print(f"Error getting FPT price from Yahoo Finance: {e}")
    
    return None

def get_fpt_price_vietstock():
    """Get FPT price from VietStock API"""
    try:
        # VietStock public API endpoint
        url = "https://finance.vietstock.vn/data/KLGDTuDoanhNoiDiaTheoMa"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'application/json'
        }
        
        params = {
            'code': 'FPT'
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"VietStock API response: {data}")
                return data
            except:
                print("Could not parse VietStock response as JSON")
                
    except Exception as e:
        print(f"Error getting FPT price from VietStock: {e}")
    
    return None

if __name__ == "__main__":
    print("Fetching FPT stock price from multiple sources...\n")
    
    # Try Yahoo Finance first
    print("1. Trying Yahoo Finance...")
    yahoo_price = get_fpt_price_yahoo()
    
    print("\n" + "="*50)
    
    # Try VietStock
    print("2. Trying VietStock...")
    vietstock_data = get_fpt_price_vietstock()
    
    print("\n" + "="*50)
    
    if yahoo_price:
        print(f"\n📈 **Latest FPT Stock Price: {yahoo_price:,.0f} VND**")
        print("Source: Yahoo Finance")
    else:
        print("\n❌ Could not retrieve FPT stock price from available sources")
        print("This might be due to market hours or API limitations")