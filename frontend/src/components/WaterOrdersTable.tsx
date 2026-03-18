import React, { useState, useEffect } from 'react';

interface WaterOrder {
  name: string;
  order_type: string;
  product: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const WaterOrdersTable: React.FC
