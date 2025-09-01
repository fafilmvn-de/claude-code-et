#!/usr/bin/env python3
"""
STEP 1: Test basic Binance API connection
"""

import requests
import time
from datetime import datetime

def test_api_connection():
    """Test if Binance API is working"""
    print("🔍 STEP 1: Testing Binance API connection...")
    
    try:
        # Test server time first
        print("   📡 Testing server time...")
        response = requests.get("https://api.binance.com/api/v3/time", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            server_time = response.json()
            print(f"   ✅ Server time: {datetime.fromtimestamp(server_time['serverTime']/1000)}")
        else:
            print(f"   ❌ Server time failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        return False
    
    try:
        # Test exchange info
        print("   📡 Testing exchange info...")
        response = requests.get("https://api.binance.com/api/v3/exchangeInfo", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Exchange info OK")
        else:
            print(f"   ❌ Exchange info failed")
            return False
            
    except Exception as e:
        print(f"   ❌ Exchange info failed: {e}")
        return False
    
    try:
        # Test BTCUSDT ticker
        print("   📡 Testing BTCUSDT ticker...")
        response = requests.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            ticker = response.json()
            print(f"   ✅ Current BTCUSDT price: ${float(ticker['price']):,.2f}")
        else:
            print(f"   ❌ Ticker failed")
            return False
            
    except Exception as e:
        print(f"   ❌ Ticker failed: {e}")
        return False
    
    print("✅ STEP 1 COMPLETE: API connection is working!")
    return True

def test_single_kline_request():
    """Test getting just 1 kline record"""
    print("\n🔍 STEP 2: Testing single kline request...")
    
    try:
        params = {
            'symbol': 'BTCUSDT',
            'interval': '1h',
            'limit': 1
        }
        
        print(f"   📡 Requesting 1 hour of BTCUSDT data...")
        start_time = time.time()
        
        response = requests.get("https://api.binance.com/api/v3/klines", params=params, timeout=10)
        
        end_time = time.time()
        request_time = end_time - start_time
        
        print(f"   ⏰ Request took: {request_time:.2f} seconds")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Got {len(data)} record(s)")
            
            if data:
                record = data[0]
                open_time = datetime.fromtimestamp(record[0] / 1000)
                close_price = float(record[4])
                print(f"   📅 Time: {open_time}")
                print(f"   💰 Close: ${close_price:,.2f}")
                
        else:
            print(f"   ❌ Failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Single kline failed: {e}")
        return False
    
    print("✅ STEP 2 COMPLETE: Single kline request works!")
    return True

def test_batch_request():
    """Test getting a batch of 10 records"""
    print("\n🔍 STEP 3: Testing batch request (10 records)...")
    
    try:
        params = {
            'symbol': 'BTCUSDT',
            'interval': '1h',
            'limit': 10
        }
        
        print(f"   📡 Requesting 10 hours of BTCUSDT data...")
        start_time = time.time()
        
        response = requests.get("https://api.binance.com/api/v3/klines", params=params, timeout=10)
        
        end_time = time.time()
        request_time = end_time - start_time
        
        print(f"   ⏰ Request took: {request_time:.2f} seconds")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Got {len(data)} records")
            
            if data:
                first = data[0]
                last = data[-1]
                first_time = datetime.fromtimestamp(first[0] / 1000)
                last_time = datetime.fromtimestamp(last[0] / 1000)
                
                print(f"   📅 From: {first_time}")
                print(f"   📅 To: {last_time}")
                print(f"   💰 Price range: ${float(first[4]):,.2f} - ${float(last[4]):,.2f}")
                
        else:
            print(f"   ❌ Failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Batch request failed: {e}")
        return False
    
    print("✅ STEP 3 COMPLETE: Batch request works!")
    return True

if __name__ == "__main__":
    print("🧪 BINANCE API DIAGNOSTIC TEST")
    print("=" * 50)
    
    success = True
    
    success = test_api_connection() and success
    if not success:
        print("❌ STOPPING: Basic API connection failed")
        exit(1)
    
    success = test_single_kline_request() and success 
    if not success:
        print("❌ STOPPING: Single kline request failed")
        exit(1)
        
    success = test_batch_request() and success
    if not success:
        print("❌ STOPPING: Batch request failed") 
        exit(1)
    
    print("\n🎉 ALL TESTS PASSED!")
    print("✅ Ready to proceed with full data collection")