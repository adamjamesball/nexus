import { sustainabilityAgents, getAgentsByCategory, getAgentById } from '../sustainabilityAgents'

describe('sustainabilityAgents', () => {
  it('contains the expected number of agents', () => {
    expect(sustainabilityAgents).toHaveLength(11)
  })

  it('contains agents with required properties', () => {
    sustainabilityAgents.forEach(agent => {
      expect(agent).toHaveProperty('id')
      expect(agent).toHaveProperty('name')
      expect(agent).toHaveProperty('description')
      expect(agent).toHaveProperty('icon')
      expect(agent).toHaveProperty('capabilities')
      expect(agent).toHaveProperty('status')
      expect(agent).toHaveProperty('category')
      expect(agent).toHaveProperty('color')
      expect(agent).toHaveProperty('domains')
      expect(agent).toHaveProperty('frameworks')
      
      // Validate structure
      expect(typeof agent.id).toBe('string')
      expect(typeof agent.name).toBe('string')
      expect(typeof agent.description).toBe('string')
      expect(Array.isArray(agent.capabilities)).toBe(true)
      expect(Array.isArray(agent.domains)).toBe(true)
      expect(Array.isArray(agent.frameworks)).toBe(true)
      
      // Validate status
      expect(['available', 'processing', 'offline']).toContain(agent.status)
      
      // Validate category
      expect(['environmental', 'social', 'governance', 'analysis']).toContain(agent.category)
      
      // Validate color structure
      expect(agent.color).toHaveProperty('light')
      expect(agent.color).toHaveProperty('dark')
      expect(agent.color).toHaveProperty('accent')
    })
  })

  it('has unique agent IDs', () => {
    const ids = sustainabilityAgents.map(agent => agent.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('has unique agent names', () => {
    const names = sustainabilityAgents.map(agent => agent.name)
    const uniqueNames = new Set(names)
    expect(uniqueNames.size).toBe(names.length)
  })

  describe('getAgentsByCategory', () => {
    it('returns environmental agents', () => {
      const environmentalAgents = getAgentsByCategory('environmental')
      expect(environmentalAgents.every(agent => agent.category === 'environmental')).toBe(true)
      expect(environmentalAgents.length).toBeGreaterThan(0)
    })

    it('returns social agents', () => {
      const socialAgents = getAgentsByCategory('social')
      expect(socialAgents.every(agent => agent.category === 'social')).toBe(true)
      expect(socialAgents.length).toBeGreaterThan(0)
    })

    it('returns governance agents', () => {
      const governanceAgents = getAgentsByCategory('governance')
      expect(governanceAgents.every(agent => agent.category === 'governance')).toBe(true)
      expect(governanceAgents.length).toBeGreaterThan(0)
    })

    it('returns analysis agents', () => {
      const analysisAgents = getAgentsByCategory('analysis')
      expect(analysisAgents.every(agent => agent.category === 'analysis')).toBe(true)
      expect(analysisAgents.length).toBeGreaterThan(0)
    })

    it('returns empty array for invalid category', () => {
      // @ts-expect-error Testing invalid category
      const invalidAgents = getAgentsByCategory('invalid')
      expect(invalidAgents).toEqual([])
    })
  })

  describe('getAgentById', () => {
    it('returns agent for valid ID', () => {
      const agent = getAgentById('carbon-expert')
      expect(agent).toBeDefined()
      expect(agent?.id).toBe('carbon-expert')
      expect(agent?.name).toBe('Carbon Expert Agent')
    })

    it('returns undefined for invalid ID', () => {
      const agent = getAgentById('non-existent-agent')
      expect(agent).toBeUndefined()
    })

    it('returns correct agent for each known ID', () => {
      const knownIds = [
        'smart-document',
        'carbon-expert',
        'nature-expert',
        'pcf-expert',
        'entity-intelligence',
        'social-impact',
        'compliance-agent',
        'strategic-insight',
        'report-generator'
      ]

      knownIds.forEach(id => {
        const agent = getAgentById(id)
        expect(agent).toBeDefined()
        expect(agent?.id).toBe(id)
      })
    })
  })

  describe('agent content quality', () => {
    it('has meaningful descriptions', () => {
      sustainabilityAgents.forEach(agent => {
        expect(agent.description.length).toBeGreaterThan(50)
        expect(agent.description).toMatch(/sustainability|analysis|assessment/)
      })
    })

    it('has relevant capabilities', () => {
      sustainabilityAgents.forEach(agent => {
        expect(agent.capabilities.length).toBeGreaterThan(2)
        agent.capabilities.forEach(capability => {
          expect(capability.length).toBeGreaterThan(10)
        })
      })
    })

    it('has relevant domains', () => {
      sustainabilityAgents.forEach(agent => {
        expect(agent.domains.length).toBeGreaterThan(0)
        agent.domains.forEach(domain => {
          expect(domain.length).toBeGreaterThan(3)
        })
      })
    })

    it('has relevant frameworks', () => {
      sustainabilityAgents.forEach(agent => {
        expect(agent.frameworks.length).toBeGreaterThan(0)
        agent.frameworks.forEach(framework => {
          expect(framework.length).toBeGreaterThan(2)
        })
      })
    })
  })

  describe('sustainability domain coverage', () => {
    it('covers carbon and climate domains', () => {
      const hasCarbon = sustainabilityAgents.some(agent => 
        agent.domains.some(domain => domain.toLowerCase().includes('carbon')) ||
        agent.name.toLowerCase().includes('carbon')
      )
      expect(hasCarbon).toBe(true)
    })

    it('covers nature and biodiversity domains', () => {
      const hasNature = sustainabilityAgents.some(agent => 
        agent.domains.some(domain => domain.toLowerCase().includes('nature') || domain.toLowerCase().includes('biodiversity')) ||
        agent.name.toLowerCase().includes('nature')
      )
      expect(hasNature).toBe(true)
    })

    it('covers social impact domains', () => {
      const hasSocial = sustainabilityAgents.some(agent => 
        agent.domains.some(domain => domain.toLowerCase().includes('social')) ||
        agent.name.toLowerCase().includes('social')
      )
      expect(hasSocial).toBe(true)
    })

    it('covers governance domains', () => {
      const hasGovernance = sustainabilityAgents.some(agent => 
        agent.category === 'governance' ||
        agent.domains.some(domain => domain.toLowerCase().includes('governance'))
      )
      expect(hasGovernance).toBe(true)
    })
  })
})