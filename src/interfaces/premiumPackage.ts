export interface PackageProps {
  identifier: string; // $rc_annual
  offeringIdentifier: string; // Premium default
  packageType: string; // ANNUAL
  presentedOfferingContext: {
    offeringIdentifier: string; // Premium default
    placementIdentifier: any | null;
    targetingContext: any | null;
  };
  product: {
    currencyCode: string; // BRL
    defaultOption: {
      billingPeriod: any; // {}
      freePhase: any; // {}
      fullPricePhase: any; // {}
      id: string;
      installmentsInfo: any | null;
      introPhase: any; // {}
      isBasePlan: boolean;
      isPrepaid: boolean;
      presentedOfferingContext: any; // {}
      presentedOfferingIdentifier: string;
      pricingPhases: any[];
      productId: string;
      storeProductId: string;
      tags: any[];
    };
    description: string;
    discounts: any | null;
    identifier: string; // premium_0:annual
    introPrice: {
      cycles: number; // 1
      period: string; // P2W
      periodNumberOfUnits: number; // 14
      periodUnit: string; // DAY
      price: number; // 0
      priceString: string; // R$0.00
    };
    presentedOfferingContext: {
      offeringIdentifier: string;
      placementIdentifier: any | null;
      targetingContext: any | null;
    };
    presentedOfferingIdentifier: string; // Premium default
    price: number; // 99.99
    pricePerMonth: number; // 8332500
    pricePerMonthString: string; // R$8.33
    pricePerWeek: number; // 1917616
    pricePerWeekString: string; // R$1.92
    pricePerYear: number; // 99990000
    pricePerYearString: string; // R$99.99
    priceString: string; // R$99.99
    productCategory: string; // SUBSCRIPTION
    productType: string; // AUTO_RENEWABLE_SUBSCRIPTION
    subscriptionOptions: any[]; // [[Object], [Object]]
    subscriptionPeriod: string; // P1Y
    title: string; // Premium Anual (Smart Finances)
  };
}
