# /deprovision

Remove a user's ClawHost instance from Dokploy and mark as cancelled.

## Usage
```
/deprovision <userId>
```

## Steps
1. Look up instance by userId
2. Call Dokploy API: DELETE project by `dokployProjectId`
3. Update DB: `status: cancelled`, `appUrl: null`
4. Print result
